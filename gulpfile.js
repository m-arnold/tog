(function () {
  'use strict';
})();

var gulp = require('gulp'),
  mocha = require('gulp-mocha'),
  eslint = require('gulp-eslint'),
  browserSync = require('browser-sync').create(),
  uglify = require('gulp-uglify'),
  // clean = require('gulp-clean'),
  // gutil = require('gulp-util'),
  // bower = require('bower'),
  concat = require('gulp-concat'),
  del = require('del'),
  jade = require('gulp-jade'),
  minifyCss = require('gulp-minify-css'),
  sourcemaps = require('gulp-sourcemaps'),
  concatCss = require('gulp-concat'),
  ngAnnotate = require('gulp-ng-annotate'),
  sass = require('gulp-sass');
// rename = require('gulp-rename'),
// sh = require('shelljs');

/* asset paths */
var paths = {
  scripts: ['client/js/**/*.js', '!client/lib/**/*'],
  css: 'client/assets/scss/*.scss',
  jade: ['client/**/*.jade', 'client/*.jade']
};


/* gulp default task */
gulp.task('default', ['lint', 'test'], function () {
  console.log('READDDDY TO RUMMMMBLE');
});


/* main watch task which will compile assets and refresh */
gulp.task('watch', ['browser-sync'], function () {
  gulp.watch(paths.css, ['sass']);
  gulp.watch(paths.jade, ['jade']);
});




/* build task, which will properly build entire client */
gulp.task('build', ['scripts', 'css', 'html'], function () {
  console.log('app built');
});



/* clean dist folder */
gulp.task('clean', function (cb) {
  del(['dist'], cb);
});


/* minify and concat js files */
gulp.task('scripts', function () {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(ngAnnotate())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/js'));
});


/* css compiliation for production. Also browsersync called */
gulp.task('css', function () {
  return gulp.src(paths.css)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(minifyCss())
    .pipe(concatCss("styles.min.css"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./dist/css"));
});

/* simply compile sass to css */
gulp.task('sass', function () {
  return gulp.src(paths.css)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(minifyCss())
    .pipe(concatCss("styles.min.css"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./client/assets/css"))
    .pipe(browserSync.stream());
});


/* browser sync initialization */
gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./client"
    }
  });
  gulp.watch(["./client/**/*.js", "./client/assets/css/*.css", "./client/**/*.html", "./client/index.html"]).on('change', browserSync.reload);
});

/* jade compiliation */
gulp.task('jade', [], function () {
  gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('./client/'))
    .pipe(browserSync.stream());
});

/* html build */
gulp.task('html', [], function () {
  gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('./dist/'));
});

/* testing call */
gulp.task('test', [], function () {
  console.log('*****TESTING*****');
  return gulp.src(['test/**/*.js'], {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec',
      globals: {
        chai: require('chai'),
        assert: require('chai').assert,
        expect: require('chai').expect,
        should: require('chai').should()
      }
    }));
});

// /* eslint task */
gulp.task('lint', function () {
  console.log('*****LINTING*****');
  return gulp.src(['server/**/*.js', 'client/**/*.js', './gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

/* integrate instructions */
gulp.task('integrate', function () {
  console.log('\n');
  console.log('*****DEV TEAM TASKS******');
  console.log('\n');
  console.log('1. ensure that you have latest known-good code. ("git pull --rebase upstream master")');
  console.log('2. make sure git status is clean');
  console.log('3. test and lint on your box (run "gulp")');
  console.log('4. Squash any unecessary commits with rebase');
  console.log('5. push to YOUR repository branch ("git push origin staging")');
  console.log('6. Create pull request to master branch of upstream repo');
  console.log('7. If PR closes your issue, write "close #<issue number>"');
  console.log('\n');
  console.log('*****YOU DID IT******');
});