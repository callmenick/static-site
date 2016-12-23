'use strict';

const autoprefixer = require('autoprefixer');
const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const copy = require('gulp-copy');
const cssnano = require('cssnano');
const es = require('event-stream');
const git = require('./util/git.js');
const glob = require('glob');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const path = require('path');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const runSequence = require('run-sequence');
const scss = require('gulp-sass');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const streamify = require('gulp-streamify');
const uglify = require('gulp-uglify');

const styles = [
  './src/scss/**/*.scss'
];

const scripts = './src/js/*.js';

const views = [
  './src/views/**/*.pug',
  '!./src/views/_layouts/**/*.pug',
  '!./src/views/_partials/**/*.pug',
  '!./src/views/_templates/**/*.pug'
];

const images = ['./src/img/**/*'];

const assets = [
  './src/manifest.json',
  './src/fonts/*'
];

/** Styles - development tasks */
gulp.task('styles:development', function() {
  return gulp.src(styles)
    .pipe(sourcemaps.init())
      .pipe(scss({
        outputStyle: 'expanded'
      }).on('error', function(error) {
        console.log('scss error:', error.message);
        this.emit('end');
      }))
      .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('./.tmp/css'))
    .pipe(browserSync.stream());
});

/** Styles - production task */
gulp.task('styles:production', function() {
  return gulp.src(styles)
    .pipe(sourcemaps.init())
      .pipe(scss().on('error', function(error) {
        console.log('scss error:', error.message);
        process.exit(1);
        this.emit('end');
      }))
      .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('./dist/css'));
});

/** Scrips - development task */
gulp.task('scripts:development', done => {
  glob(scripts, (err, files) => {
    if (err) done(err);

    const tasks = files.map(file => {
      return browserify(file)
        .transform(babelify, {
          presets: ['es2015', 'stage-1']
        })
        .bundle()
        .on('error', function(error) {
          console.log('js error:', error.message);
          this.emit('end');
        })
        .pipe(source(path.basename(file)))
        .pipe(streamify(sourcemaps.init()))
        .pipe(streamify(sourcemaps.write('../maps')))
        .pipe(gulp.dest('./.tmp/js'));
    });

    es.merge(tasks).on('end', done);
  });
});

/** Scripts - production task */
gulp.task('scripts:production', done => {
  glob(scripts, (err, files) => {
    if (err) done(err);

    const tasks = files.map(file => {
      return browserify(file)
        .transform(babelify, {
          presets: ['es2015', 'stage-1']
        })
        .bundle()
        .on('error', function(error) {
          console.log('js error:', error.message);
          process.exit(1);
          this.emit('end');
        })
        .pipe(source(path.basename(file)))
        .pipe(streamify(sourcemaps.init()))
        .pipe(streamify(uglify()))
        .pipe(streamify(sourcemaps.write('../maps')))
        .pipe(gulp.dest('./dist/js'));
    });

    es.merge(tasks).on('end', done);
  });
});

/** Views - development task */
gulp.task('views:development', function() {
  return gulp.src(views)
    .pipe(pug({
      pretty: true,
      locals: require('./config/development.js')
    }).on('error', function(error) {
      console.log('pug error:', error.message);
      this.emit('end');
    }))
    .pipe(gulp.dest('./.tmp'))
    .pipe(browserSync.stream());
});

/** Views - production task */
gulp.task('views:production', function() {
  return gulp.src(views)
    .pipe(pug({
      locals: require('./config/production.js')
    }).on('error', function(error) {
      console.log('pug error:', error);
      process.exit(1);
      this.emit('end');
    }))
    .pipe(gulp.dest('./dist'));
});

/** Images - development task */
gulp.task('images:development', function() {
  return gulp.src(images)
    .pipe(imagemin([
      imagemin.jpegtran(),
      imagemin.optipng(),
      imagemin.svgo()
    ]).on('error', function(error) {
      console.log('images error:', error.message);
      this.emit('end');
    }))
    .pipe(gulp.dest('./.tmp/img'));
});

/** Images - production task */
gulp.task('images:production', function() {
  return gulp.src(images)
    .pipe(imagemin([
      imagemin.jpegtran(),
      imagemin.optipng(),
      imagemin.svgo()
    ]).on('error', function(error) {
      console.log('images error:', error.message);
      process.exit(1);
      this.emit('end');
    }))
    .pipe(gulp.dest('./dist/img'));
});

/** Assets - development task */
gulp.task('assets:development', function() {
  return gulp.src(assets)
    .pipe(copy('./.tmp', {
      prefix: 1
    }));
});

/** Assets - production task */
gulp.task('assets:production', function() {
  return gulp.src(assets)
    .pipe(copy('./dist', {
      prefix: 1
    }));
});

/** Browser sync - inits browser sync */
gulp.task('browsersync', function() {
  browserSync.init({
    server: './.tmp/'
  });

  gulp.watch('./src/scss/**/*.scss', ['styles:development']).on('change', browserSync.reload);
  gulp.watch('./src/js/**/*.js', ['scripts:development']).on('change', browserSync.reload);
  gulp.watch('./src/views/**/*.pug', ['views:development']).on('change', browserSync.reload);
  gulp.watch('./src/img/**/*', ['images:development']).on('change', browserSync.reload);
  gulp.watch(assets, ['assets:development']).on('change', browserSync.reload);
  gulp.watch('./.tmp/**/*.html').on('change', browserSync.reload);
});

/** Serve task - launches a local dev server */
gulp.task('serve', function(done) {
  const asyncTasks = [
    'styles:development',
    'scripts:development',
    'views:development',
    'images:development',
    'assets:development'
  ];

  runSequence('clean:development', asyncTasks, 'browsersync', function() {
    done();
  });
});

/** Clean task - cleans dev directories */
gulp.task('clean:development', function() {
  return gulp.src('./.tmp', {
    read: false
  }).pipe(clean());
});

/** Clean task - cleans prod directories */
gulp.task('clean:production', function() {
  return gulp.src('./dist', {
    read: false
  }).pipe(clean());
});

/** Build task - builds for production */
gulp.task('build', function(done) {
  const asyncTasks = [
    'styles:production',
    'scripts:production',
    'views:production',
    'images:production',
    'assets:production'
  ];

  runSequence('clean:production', asyncTasks, function(err) {
    done();
  });
});

/** Deploy task - builds and deploys to gh-pages branch */
gulp.task('deploy', ['build'], function() {
  git.checkout()
    .then(git.add)
    .then(git.commit)
    .then(git.subtree)
    .then(git.push)
    .then(git.del)
    .then(function() {
      console.log('Successfully deployed.');
    })
    .catch(function(err) {
      console.log('Error:', err);
    });
});

/** Default task */
gulp.task('default', ['styles:production', 'views:production']);
