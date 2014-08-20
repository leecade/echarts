// 1. bower up

// 2. mv zrender -> src

// 3. AMD -> CMD

var Buffer = require('buffer').Buffer
var path = require('path')
var gulp = require('gulp')
var shell = require('gulp-shell')
var beautify = require('gulp-beautify')
var clean = require('gulp-clean')
var through = require('through2')
var parse = require('nodefy').parse
var gutil = require('gulp-util')

var nodefy = function () {
    var transform = function (file, enc, cb) {
        if (file.isNull()) return cb(null, file); 
        if (file.isStream()) return cb(new gutil.PluginError('gulp-nodefy', 'Streaming not supported'));

        var data;
        var str = file.contents.toString('utf8');

        // fixes: define({}) => module.exports = {}
        if(/define\([\s\r\n]*{/.test(str))
            str = str
                .replace(/define\([\s\r\n]*{/, 'define(function() {return {')
                .replace(/\);?[\s\r\n]*$/, '});')

        try {
            data = parse(str);
        } catch (err) {
            
            return cb(new gutil.PluginError('gulp-nodefy', err));
        }

        file.contents = new Buffer(data);
        cb(null, file);
    };

    return through.obj(transform);
};

gulp.task('clean', function(cb) {
  return gulp.src(['./amd', './src'])
    .pipe(clean())
})

gulp.task('update', ['clean'], shell.task([
  'bower install ecomfe/echarts ecomfe/zrender',
  'cp -r bower_components/echarts/src ./amd',
  'cp -r bower_components/zrender/src ./amd/zrender',
  'cp -r bower_components/echarts/build ./'
]))

gulp.task('build', ['update'], function() {
  gulp.src('./amd/**/*.js')
    .pipe(nodefy())
    .pipe(beautify())
    .pipe(gulp.dest('./src'))
})

gulp.task('default', ['build']);