var gulp = require('gulp');

gulp.task('css:lib', function () {

  var concat = require('gulp-concat');
  var csso   = require('gulp-csso');

  gulp.src([
    'bower_components/normalize.css/normalize.css',
    'bower_components/font-awesome/css/font-awesome.css'
  ]).pipe(concat('lib.min.css'))
    .pipe(csso())
    .pipe(gulp.dest('build/css/'));
});

gulp.task('css:app', function () {

  var concat = require('gulp-concat');
  var csso   = require('gulp-csso');

  gulp.src([
    'src/css/index.css'
  ]).pipe(concat('app.min.css'))
    .pipe(csso())
    .pipe(gulp.dest('build/css/'));
});

gulp.task('js:lib', function () {

  var concat = require('gulp-concat');
  var uglify = require('gulp-uglify');

  gulp.src([
    'bower_components/jquery/dist/jquery.js',
    'src/js/jquery-suffix.js',
    'bower_components/mustache/mustache.js'
  ]).pipe(concat('lib.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('js:app', function () {

  var browserify = require("browserify");
  var babelify   = require("babelify");
  var source     = require('vinyl-source-stream');
  var buffer     = require('vinyl-buffer');
  var uglify     = require("gulp-uglify");

  browserify({
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

  gulp.src([
    'bower_components/loading/*.svg'
  ]).pipe(gulp.dest('build/img/loading'));

  gulp.src([
    'bower_components/font-awesome/fonts/*'
  ]).pipe(gulp.dest('build/fonts'));

});

gulp.task('build', function () {
  gulp.start('css:app', 'css:lib', 'js:app', 'js:lib', 'copy');
});
