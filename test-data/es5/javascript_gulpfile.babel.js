"use strict";

/* eslint no-console: 0, arrow-body-style: 0 */

/*https://github.com/pubnub/javascript/blob/master/gulpfile.babel.js*/
var gulp = require('gulp');

var path = require('path');

var babel = require('gulp-babel');

var clean = require('gulp-clean');

var gulpWebpack = require('webpack-stream');

var webpackConfig = require('./webpack.config');

var eslint = require('gulp-eslint');

var uglify = require('gulp-uglify');

var rename = require('gulp-rename');

var exec = require('child_process').exec;

var Karma = require('karma').Server;

var mocha = require('gulp-mocha');

var runSequence = require('run-sequence');

var gulpIstanbul = require('gulp-istanbul');

var isparta = require('isparta');

var sourcemaps = require('gulp-sourcemaps');

var packageJSON = require('./package.json');

var gzip = require('gulp-gzip');

var unzip = require('gulp-unzip');

gulp.task('clean', function () {
  return gulp.src(['lib', 'dist', 'coverage', 'upload'], {
    read: false
  }).pipe(clean());
});
gulp.task('babel', function () {
  return gulp.src('src/**/*.js').pipe(sourcemaps.init()).pipe(babel()).pipe(sourcemaps.write('.')).pipe(gulp.dest('lib'));
});
gulp.task('unzip_titanium_sdk', function () {
  return gulp.src('resources/titanium.zip').pipe(unzip()).pipe(gulp.dest('resources/'));
});
gulp.task('compile_web', function () {
  return gulp.src('src/web/index.js').pipe(gulpWebpack(webpackConfig)).pipe(gulp.dest('dist/web'));
});
gulp.task('compile_titanium', function () {
  return gulp.src('src/titanium/index.js').pipe(gulpWebpack(webpackConfig)).pipe(gulp.dest('dist/titanium'));
});
gulp.task('create_version', function () {
  return gulp.src('dist/web/pubnub.js').pipe(rename("pubnub." + packageJSON.version + ".js")).pipe(gulp.dest('upload/normal'));
});
gulp.task('create_version_gzip', function () {
  return gulp.src('upload/normal/*.js').pipe(gzip({
    append: false
  })).pipe(gulp.dest('upload/gzip'));
});
gulp.task('uglify_web', function () {
  return gulp.src('dist/web/pubnub.js').pipe(uglify({
    mangle: true,
    compress: true
  })).pipe(rename('pubnub.min.js')).pipe(gulp.dest('dist/web')).pipe(rename("pubnub." + packageJSON.version + ".min.js")).pipe(gulp.dest('upload/normal'));
});
gulp.task('uglify_titanium', function () {
  return gulp.src('dist/titanium/pubnub.js').pipe(uglify({
    mangle: true,
    compress: true
  })).pipe(rename('pubnub.min.js')).pipe(gulp.dest('dist/titanium'));
});
gulp.task('lint_code', [], function () {
  return gulp.src(['src/**/*.js']).pipe(eslint()).pipe(eslint.format()).pipe(eslint.failAfterError());
});
gulp.task('lint_tests', [], function () {
  return gulp.src(['test/**/*.js', '!test/dist/*.js']).pipe(eslint()).pipe(eslint.format()).pipe(eslint.failAfterError());
});
gulp.task('lint', ['lint_code', 'lint_tests']);
gulp.task('flow', function (cb) {
  return exec('./node_modules/.bin/flow --show-all-errors', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});
gulp.task('validate', ['lint', 'flow']);
gulp.task('pre-test', function () {
  return gulp.src(['src/**/*.js']).pipe(gulpIstanbul({
    instrumenter: isparta.Instrumenter,
    includeAllSources: true
  })).pipe(gulpIstanbul.hookRequire());
});
gulp.task('test_web', function (done) {
  new Karma({
    configFile: path.join(__dirname, '/karma/web.config.js')
  }, done).start();
});
gulp.task('test_node', function () {
  return gulp.src(['test/**/*.test.js', '!test/dist/*.js'], {
    read: false
  }).pipe(mocha({
    reporter: 'spec'
  })).pipe(gulpIstanbul.writeReports({
    reporters: ['json', 'lcov', 'text']
  }));
});
gulp.task('test_titanium', ['unzip_titanium_sdk'], function (done) {
  new Karma({
    configFile: path.join(__dirname, '/karma/titanium.config.js')
  }, done).start();
});
gulp.task('test_react-native', function () {
  return gulp.src('test/dist/react-native.test.js', {
    read: false
  }).pipe(mocha({
    reporter: 'spec'
  })).pipe(gulpIstanbul.writeReports({
    reporters: ['json', 'lcov', 'text']
  }));
});
gulp.task('test_release', function () {
  return gulp.src('test/release/**/*.test.js', {
    read: false
  }).pipe(mocha({
    reporter: 'spec'
  }));
});
gulp.task('test', function (done) {
  runSequence('pre-test', 'test_node', 'test_web', 'test_titanium', 'test_react-native', 'test_release', 'validate', function () {
    process.exit();
  });
});
gulp.task('webpack', function (done) {
  runSequence('compile_web', 'compile_titanium', done);
});
gulp.task('compile', function (done) {
  runSequence('clean', 'babel', 'webpack', 'uglify_web', 'uglify_titanium', 'create_version', 'create_version_gzip', done);
});