var gulp = require('gulp');

gulp.task('css', function () {

  var concat = require('gulp-concat');

  return gulp.src([
    'node_modules/photon/dist/css/photon.min.css'
  ]).pipe(concat('app.css'))
    .pipe(gulp.dest('src/css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('js', function () {

  const babel  = require("gulp-babel");
  const uglify = require("gulp-uglify");

  return gulp.src(['./src/js/*.js'])
    .pipe(babel())
    //.pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

gulp.task('copy:app', function () {

  return gulp.src([
    'src/index.html',
    'src/app.js'
  ]).pipe(gulp.dest('build'));

});

gulp.task('copy:font', function () {

  return gulp.src([
    'node_modules/photon/dist/fonts/*'
  ]).pipe(gulp.dest('src/fonts'))
    .pipe(gulp.dest('build/fonts'));

});

gulp.task('watch', function () {
  gulp.watch('src/js/*.js', function () {
    gulp.start('js');
  });
});

gulp.task('build', function () {
  gulp.start('css', 'js', 'copy:app', 'copy:font');
});
