var gulp = require('gulp');
var sass = require('gulp-ruby-sass');

gulp.task('styles', function(){
  return sass('public/css/sass', {style:'expanded'})
  .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function(){
  gulp.watch('public/css/sass/*.scss', ['styles']);
});

gulp.task('default', ['styles', 'watch']);