var gulp = require('gulp');
var sass = require('gulp-sass');
var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var rimraf = require('rimraf');
var source = require('vinyl-source-stream');
var _ = require('lodash');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var config = {
    jsEntryFile: './src/js/main.js',
    outputDir: './resources/js/',
    outputFile: 'app.js'
};

gulp.task('default', ['build']);

gulp.task('styles', function() {
    gulp.src('src/scss/main.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('./resources/css/'))
            .pipe(browserSync.stream());
});

gulp.task('watch-styles', function () {
    return gulp.watch('src/scss/**/*.scss', ['styles']);
});

// clean the output directory
gulp.task('clean', function(cb){
    rimraf(config.outputDir, cb);
});

var bundler;
function getBundler() {
    if (!bundler) {
        bundler = watchify(browserify(config.jsEntryFile, _.extend({ debug: true }, watchify.args)));
    }
    return bundler;
}

function bundle() {
    return getBundler()
            .transform(babelify)
            .bundle()
            .on('error', function(err) { console.log('Error: ' + err.message); })
            .pipe(source(config.outputFile))
            .pipe(gulp.dest(config.outputDir))
            .pipe(reload({ stream: true }));
}

gulp.task('build-persistent', ['clean', 'styles'], function() {
    return bundle();
});

gulp.task('build', ['build-persistent'], function() {
    process.exit(0);
});

gulp.task('watch', ['build-persistent', 'watch-styles'], function() {

    browserSync({
        server: {
            baseDir: './'
        }
    });

    getBundler().on('update', function() {
        gulp.start('build-persistent')
    });
});
