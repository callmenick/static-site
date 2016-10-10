'use strict';

const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const cssnano = require('cssnano');
const git = require('./util/git.js');
const gulp = require('gulp');
const handlebars = require('gulp-handlebars');
const postcss = require('gulp-postcss');
const pug = require('gulp-pug');
const runSequence = require('run-sequence');
const scss = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

const styles = [
  './src/scss/**/*.scss'
];

const views = [
  './src/views/**/*.pug',
  '!./src/views/_layouts/**/*.pug',
  '!./src/views/_partials/**/*.pug',
  '!./src/views/_templates/**/*.pug'
];

/** Styles - development tasks */
gulp.task('styles:development', function() {
  return gulp.src(styles)
    .pipe(scss({
      outputStyle: 'expanded'
    }).on('error', function(error) {
      console.log('scss error:', error.message);
      this.emit('end');
    }))
    .pipe(postcss([autoprefixer()]))
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
    }))
    .pipe(gulp.dest('./dist'));
});

/** Browser sync - inits browser sync */
gulp.task('browsersync', function() {
  browserSync.init({
    server: './.tmp/'
  });

  gulp.watch('./src/scss/**/*.scss', ['styles:development']).on('change', browserSync.reload);
  gulp.watch('./src/views/**/*.pug', ['views:development']).on('change', browserSync.reload);
  gulp.watch('./.tmp/**/*.html').on('change', browserSync.reload);
});

/** Serve task - launches a local dev server */
gulp.task('serve', function(done) {
  runSequence('clean', ['styles:development', 'views:development'], 'browsersync', function() {
    done();
  });
});

/** Clean task - cleans directories */
gulp.task('clean', function() {
  return gulp.src(['./.tmp', './dist'], {
    read: false
  }).pipe(clean());
});

/** Build task - builds for production */
gulp.task('build', function(done) {
  runSequence('clean', ['styles:production', 'views:production'], function(err) {
    done();
  });
});

/** Deploy task - builds and deploys to gh-pages branch */
gulp.task('deploy', ['build'], function() {
  git.checkout()
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
