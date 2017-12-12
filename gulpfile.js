'use strict';

var envfile = require('envfile');
var gulp = require('gulp');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');
var watch = require('gulp-watch');
var image = require('gulp-image');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var sass = require('gulp-sass');

gulp.task('image', function () {
  gulp.src('./static/images/*')
    // .pipe(image())
    .pipe(gulp.dest('./build'));
});

gulp.task('html', function () {
  gulp.src(
    './index.html'
    )
    .pipe(gulp.dest('./build'));
});
 
gulp.task('sass', function () {
  gulp.src('./static/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build'));
});

gulp.task('css', function () {
  gulp.src([
      './static/css/font-awesome.min.css',
      './static/css/application.css',
    ])
    .pipe(gulp.dest('./build'));
});

gulp.task('js', function () {
  gulp.src([
      './static/js/jquery-3.2.1.min.js',
      './static/js/application.js',
    ])
    .pipe(gulp.dest('./build'));
});

gulp.task('fonts', function () {
  gulp.src([
      './static/fonts/**/*.*'
    ])
    .pipe(gulp.dest('./build'));
});

// gulp.task('js', function () {
//   var sourceDirectory = __dirname + '/static/js',
//     destinationDirectory = __dirname + '/build/js',
//     outputFile = 'safe-fs.js',
//     env = envfile.parseFileSync('.env');

//     var bundler = browserify(sourceDirectory + '/safe-fs.js').transform(babelify);

//     return bundler.bundle()
//       .on('error', function(err) {
//         console.log(err);
//       })
//       .pipe(source('safe-fs.js'))
//       .pipe(gulp.dest(destinationDirectory))

// });

gulp.task('serve', function () {
  var env = envfile.parseFileSync('.env');
  nodemon({
    script: './index.js',
    ext: 'html js',
    ignore: ['build/**/*.*', 'static/**/*.*', 'node_modules'],
    tasks: [],
    env: env
  }).on('restart', function () {
    console.log('server restarted....');
  });
});

gulp.task('watch', function () {
  watch(['./static/js/*.js'], function () {
    gulp.start('js');
  });

  watch('./static/sass/**/*.scss', function () {
    gulp.start('sass');
  });

  watch('./static/css/*.css', function () {
    gulp.start('css');
  });

  watch('./index.html', function () {
    gulp.start('html');
  });
});

gulp.task('default', ['html', 'sass', 'css', 'js', 'watch', 'serve', 'fonts', 'image']);
