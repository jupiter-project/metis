const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', () => {
  // Bootstrap
  gulp.src([
    'node_modules/bootstrap/dist/**/*',
    '!node_modules/bootstrap/dist/css/bootstrap-grid*',
    '!node_modules/bootstrap/dist/css/bootstrap-reboot*',
  ])
    .pipe(gulp.dest('public/vendor/bootstrap'));
  // Font Awesome
  gulp.src([
    'node_modules/font-awesome/**/*',
    '!node_modules/font-awesome/{less,less/*}',
    '!node_modules/font-awesome/{scss,scss/*}',
    '!node_modules/font-awesome/.*',
    '!node_modules/font-awesome/*.{txt,json,md}',
  ])
    .pipe(gulp.dest('public/vendor/font-awesome'));
});
// Compile SCSS
gulp.task('css:compile', () => {
  return gulp.src('public/scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded',
    }).on('error', sass.logError))
    .pipe(gulp.dest('public/css'));
});
// Minify CSS
gulp.task('css:minify', ['css:compile'], () => {
  return gulp.src([
    'public/css/*.css',
    '!public/css/*.min.css',
  ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(gulp.dest('public/css'));
});
// CSS
gulp.task('css', ['css:compile', 'css:minify']);
// Minify JavaScript
gulp.task('js:minify', () => {
  return gulp.src([
    'public/js/*.js',
    '!public/js/*.min.js',
  ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(gulp.dest('public/js'));
});
// JS
gulp.task('js', ['js:minify']);

// Default task
gulp.task('default', ['css', 'js', 'vendor']);
// Dev task
gulp.task('dev', ['css', 'js'], () => {
  gulp.watch('public/scss/**/*.scss', ['css']);
  gulp.watch('public/js/*.js', ['js']);
});
