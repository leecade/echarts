var Buffer = require('buffer').Buffer
var path = require('path')
var gulp = require('gulp')
var shell = require('gulp-shell')
var beautify = require('gulp-beautify')
var replace = require('gulp-replace')
var clean = require('gulp-clean')
var merge = require('merge-stream')
var through = require('through2')
var parse = require('nodefy').parse
var gutil = require('gulp-util')

var nodefy = function () {
    var transform = function (file, enc, cb) {
        if (file.isNull()) return cb(null, file) 
        if (file.isStream()) return cb(new gutil.PluginError('gulp-nodefy', 'Streaming not supported'))

        var data
        var str = file.contents.toString('utf8')

        // fixed: require('./config') => require('./config.js')
        str = str.replace(/(require\(['"]((?!\.js)[^'"])*)/g, "$1.js")

        // fixes: define({}) => module.exports = {}
        if(/define\([\s\r\n]*{/.test(str))
            str = str
                .replace(/define\([\s\r\n]*{/, 'define(function() {return {')
                .replace(/\);?[\s\r\n]*$/, '});')

        try {
          data = parse(str)
        } catch (err) {
          return cb(new gutil.PluginError('gulp-nodefy', err))
        }

        file.contents = new Buffer(data)
        cb(null, file)
    }

    return through.obj(transform)
}

gulp.task('clean', function() {
  return gulp.src(['./amd', './src', './build'])
    .pipe(clean())
})

gulp.task('update', ['clean'], function() {
  return gulp.src('./')
    .pipe(shell([
    'bower install ecomfe/zrender',
    'bower install ecomfe/echarts',
    'cp -r bower_components/echarts/src ./amd',
    'cp -r bower_components/zrender/src ./amd/zrender',
    'cp -r bower_components/echarts/build ./'
  ]))
})

gulp.task('migrate', ['update'], function() {
    return merge(
        gulp.src('./amd/echarts.js')
          .pipe(replace('require(\'zrender\'', 'require(\'./zrender/zrender\''))
          .pipe(gulp.dest('./amd/')),
        gulp.src('./amd/*.js')
          .pipe(replace('require(\'zrender/', 'require(\'./zrender/'))
          .pipe(gulp.dest('./amd/')),
        gulp.src('./amd/chart/*.js')
          .pipe(replace('require(\'zrender', 'require(\'../zrender'))
          .pipe(gulp.dest('./amd/chart/')),
        gulp.src('./amd/component/*.js')
          .pipe(replace('require(\'zrender', 'require(\'../zrender'))
          .pipe(gulp.dest('./amd/component/')),
        gulp.src('./amd/util/*.js')
          .pipe(replace('require(\'zrender', 'require(\'../zrender'))
          .pipe(gulp.dest('./amd/util/')),
        gulp.src('./amd/util/shape/*.js')
          .pipe(replace('require(\'zrender', 'require(\'../../zrender'))
          .pipe(gulp.dest('./amd/util/shape/')),
        gulp.src('./amd/util/projection/*.js')
          .pipe(replace('require(\'zrender', 'require(\'../../zrender'))
          .pipe(gulp.dest('./amd/util/projection/'))
      )
})

gulp.task('build', ['migrate'], function() {
  gulp.src('./amd/**/*.js')
    .pipe(nodefy())
    .pipe(beautify())
    .pipe(gulp.dest('./src'))
})

gulp.task('default', ['build'])