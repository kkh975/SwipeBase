var gulp          = require('gulp');
var del           = require('del');
var gutil         = require('gulp-util');
var sequence      = require('gulp-sequence');
var webpack       = require('gulp-webpack');
var webpackConfig = require('./webpack.config.js');

var clientSrcPath  = 'src/';
var clientDistPath = 'dist/';

gulp.task('clean', function(){
    return del([ clientDistPath ])
});

gulp.task('js', function(){
    var src  = clientSrcPath + '/**';
    var dist = clientDistPath;

    return gulp.src(src)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest(dist));
});

gulp.task('watcher', function(){
    gulp.watch([clientSrcPath + '/**'], { interval: 500 }, [ 'js' ]).on('change', function( event ){
        gutil.log('File', gutil.colors.yellow(event.path), 'was', gutil.colors.magenta(event.type));
    });
});

gulp.task('default', sequence('clean', 'js', 'watcher'));
