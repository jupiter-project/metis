const gulp = require('gulp');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');

// Copy third party libraries from /node_modules into /vendor
// gulp.task('vendor', () => {

//   // Bootstrap
//   gulp.src([
//       './node_modules/bootstrap/dist/**/*',
//       '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
//       '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
//     ])
//     .pipe(gulp.dest('./public/vendor/bootstrap'))

// });

// Compile SCSS
gulp.task('css:compile', () => {
  gulp.src('./public/scss/**/*.scss')
    .pipe(sass.sync({
      outputStyle: 'expanded',
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false,
    }))
    .pipe(gulp.dest('./public/css'));
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], () => {
  gulp.src([
    './public/css/*.css',
    '!./public/css/*.min.css',
  ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(gulp.dest('./public/css'));
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Default task
gulp.task('default', ['css']);

// Dev task
gulp.task('dev', ['css'], () => {
  gulp.watch('./public/scss/*.scss', ['css']);
});
