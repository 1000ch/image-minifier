var gulp = require('gulp');

gulp.task('css:lib', function () {

  var concat = require('gulp-concat');

  return gulp.src([
    'node_modules/photon/dist/css/photon.min.css'
  ]).pipe(concat('lib.min.css'))
    .pipe(gulp.dest('build/css/'));
});

gulp.task('css:app', function () {

  var concat = require('gulp-concat');
  var csso   = require('gulp-csso');

  return gulp.src([])
    .pipe(concat('app.min.css'))
    .pipe(csso())
    .pipe(gulp.dest('build/css/'));
});

gulp.task('js:lib', function () {

  var concat = require('gulp-concat');
  var uglify = require('gulp-uglify');

  gulp.src([]).pipe(concat('lib.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('js:app', function () {

  var browserify = require("browserify");
  var babelify   = require("babelify");
  var source     = require('vinyl-source-stream');
  var buffer     = require('vinyl-buffer');
  var uglify     = require("gulp-uglify");

  return browserify({
    entries: ['src/js/index.js'],
    extensions: ['.js']
  }).transform(babelify)
    .bundle()
    .pipe(source('app.min.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('build/js/'));
});

gulp.task('copy', function () {

  return gulp.src([
    'node_modules/photon/dist/fonts/*'
  ]).pipe(gulp.dest('build/fonts'));

});

gulp.task('watch', function () {
  gulp.watch('src/js/*.js', function () {
    gulp.start('js:app');
  });
});

gulp.task('build', function () {
  gulp.start('css:app', 'css:lib', 'js:app', 'js:lib', 'copy');
});
