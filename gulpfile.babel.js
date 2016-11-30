import gulp from 'gulp';
import babel from 'gulp-babel';
import gutil from 'gulp-util';
import webpack from 'webpack';
import webpackConfig from './webpack.config.babel';
import WebpackDevServer from 'webpack-dev-server';
import sass from 'gulp-sass';

gulp.task('default', ['webpack', 'styles']);
gulp.task('watch', ['server', 'watchIt']);

gulp.task('babel', () => {
    return gulp.src('src/*.js')
            .pipe(babel())
            .pipe(gulp.dest('target'));
});

gulp.task('watchIt', function() {
    gulp.watch(['src/**/*', 'index.html'], ['webpack', 'styles']);
});

gulp.task('styles', function() {
    gulp.src('src/scss/*.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('./resources/css/'));
});

gulp.task('webpack', ['babel'], function(callback) {
    var myConfig = Object.create(webpackConfig);
    myConfig.plugins = [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ];

    // run webpack
    webpack(myConfig, function(err, stats) {
        if (err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
            colors: true,
            progress: true
        }));
        callback();
    });
});

gulp.task('server', ['webpack'], function(callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.devtool = 'eval';
    myConfig.debug = true;

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(myConfig), {
        publicPath: '/' + myConfig.output.publicPath,
        stats: {
            colors: true
        },
        hot: true
    }).listen(8080, 'localhost', function(err) {
        if(err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });
});