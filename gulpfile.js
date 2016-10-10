'use strict';

const gulp = require('gulp');
const git = require('./util/git.js');
const scss = require('gulp-sass');

(function() {
  gulp.task('styles', function() {
    return gulp.src('./src/scss/**/*.scss')
      .pipe(scss({
        outputStyle: 'expanded'
      }).on('error', scss.logError))
      .pipe(gulp.dest('./dist/css'));
    //   .pipe(browserSync.stream());
  });

  gulp.task('views', function() {
    // return gulp.src(['./views/**/*.pug', '!./views/layouts/**/*', '!./views/partials/**/*'])
    //   .pipe(pug().on('error', function(error) {
    //     console.log('pug error:', error.message);
    //   }))
    //   .pipe(gulp.dest('./'))
    //   .pipe(browserSync.stream());
  });

  gulp.task('serve', ['styles', 'views'], function() {
    // browserSync.init({
    //   server: './'
    // });

    // gulp.watch('./scss/**/*.scss', ['styles']);
    // gulp.watch('./views/**/*.pug', ['views']);
    // gulp.watch('./*.html').on('change', browserSync.reload);
  });

  /** Build task */
  gulp.task('build', ['styles', 'views']);

  /** Deploy task, pushes dist directory to site branch */
  gulp.task('deploy', ['build'], function() {
    git.add()
      .then(git.commit)
      .then(git.push)
      .then(function() {
        console.log('Done');
      })
      .catch(function(err) {
        console.log('Error:', err);
      });
  });

  /** Default task */
  gulp.task('default', ['styles', 'views']);
})();
