var gulp          = require('gulp');
var del           = require('del');
var sequence      = require('gulp-sequence');
var webpack       = require('gulp-webpack');
var jasmine       = require('gulp-jasmine');
var webpackConfig = require('./webpack.config.js');

var srcPath  = 'src/';
var distPath = 'dist/';
var testPath = 'spec/test.js';

gulp.task('clean', function(){
    return del([ distPath ])
});

gulp.task('test', function(){
    var src  = srcPath + '/**';
    var dist = distPath;

    return gulp.src(testPath)
        .pipe(jasmine());
});

gulp.task('js', function(){
    var src  = srcPath + '/**';
    var dist = distPath;

    return gulp.src(src)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(dist));
});

gulp.task('watcher', function(){
    gulp.watch([testPath], [ 'test' ]).on('change', function( event ){});
    gulp.watch([srcPath + '/**'], { interval: 500 }, [ 'js' ]).on('change', function( event ){});
});

gulp.task('default', sequence('clean', 'test', 'js', 'watcher'));
