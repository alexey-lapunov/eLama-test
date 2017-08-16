'use strict';

var gulp = require('gulp'),
    jade = require('gulp-jade'),
    stylus = require('gulp-stylus'),
    sourceMaps = require('gulp-sourcemaps'),
    gulpImports = require('gulp-imports'),
    eslint = require('gulp-eslint'),
    autoPrefixer = require('gulp-autoprefixer'),
    imageMin = require('gulp-imagemin'),
    imageMinMozJpeg = require('imagemin-mozjpeg'),
    imageMinPngquant = require('imagemin-pngquant'),
    newer = require('gulp-newer'),
    plumber = require('gulp-plumber'),
    prettify = require('gulp-html-prettify'),
    browserSync = require('browser-sync').create(),
    htmlRoot = '/',
    imagesFolder = 'img',
    browserSyncOptions = {
        server: './public',
        directory: true,
        open: false,
        notification: false,
        reloadOnRestart: false,
        ghostMode: false,
        startPath: 'index.html'
    },
    port = process.env.PORT;

port && (browserSyncOptions.port = port);

// gulp.task('images', function () {
//     gulp.src(['./assets/' + imagesFolder + '/*.png', './assets/' + imagesFolder + '/*.gif', './assets/' + imagesFolder + '/*.svg'])
//         .pipe(plumber())
//         .pipe(newer('./public/assets/' + imagesFolder + '/'))
//         .pipe(imageMin({
//             progressive: true,
//             interlaced: true,
//             svgoPlugins: [{removeViewBox: false}, {removeUselessStrokeAndFill: false}]
//         }))
//         .pipe(gulp.dest('./public/' + imagesFolder + '/'));
// });

gulp.task('images', function () {
    gulp.src(['./assets/' + imagesFolder + '/*.{png,jpg,gif,jpeg,svg}'])
        .pipe(plumber())
        .pipe(newer('./public/assets/' + imagesFolder + '/'))
        .pipe(imageMin([
            imageMin.gifsicle({progressive: true}),
            imageMinMozJpeg({quality: 90, progressive: true}),
            imageMinPngquant({quality: 90, verbose: true}),
            imageMin.svgo({plugins: [{removeViewBox: false}, {removeUselessStrokeAndFill: false}]}, {verbose: true})
        ]))
        .pipe(gulp.dest('./public/' + imagesFolder + '/'));
});
gulp.task('styles', function () {
    gulp.src('./assets/common/stylus/common.styl')
        .pipe(plumber())
        .pipe(sourceMaps.init())
        .pipe(stylus({
            compress: false
        }))
        .pipe(autoPrefixer({
            browsers: ['last 6 Chrome versions'],
            cascade: false
        }))
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('jade', function () {
    gulp.src('./assets/views/*.jade')
        .pipe(plumber())
        .pipe(jade({
            pretty: false
        }))
        .pipe(prettify({indent_char: ' ', indent_size: 4}))
        .pipe(gulp.dest('./public' + htmlRoot));
});

gulp.task('video', function () {
    gulp.src('./assets/video/**/*')
        .pipe(plumber())
        .pipe(newer('./assets/video/**/*'))
        .pipe(gulp.dest('./public/video'));
});

gulp.task('scripts', function () {
    gulp.src('./assets/js/**/*.js')
        .pipe(plumber())
        .pipe(newer('./assets/js/**/*'))
        .pipe(gulpImports())
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        // .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        // .pipe(eslint.format())
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('fonts', function () {
    gulp.src('./assets/fonts/**/*')
        .pipe(plumber())
        .pipe(newer('./assets/fonts/**/*'))
        .pipe(gulp.dest('./public/fonts'));
});

gulp.task('bs', function () {
    browserSync.init(browserSyncOptions);
    // browserSync.watch('./public/**/*.*').on('change', browserSync.reload);
});

gulp.task('watch', function () {
    gulp.watch(['./assets/' + imagesFolder + '/sprite.styl', 'assets/common/stylus/**/*.styl', './assets/components/**/*.styl'], ['styles']);
    gulp.watch(['./assets/common/jade/**/*.jade', './assets/components/**/*.jade', './assets/views/*.jade'], ['jade']);
    gulp.watch(['./assets/js/**/*.js', './assets/components/**/*.js'], ['scripts']);
    gulp.watch('./assets/fonts/**/*', ['fonts']);
    gulp.watch('./assets/video/**/*', ['video']);
});

gulp.task('build', ['styles', 'jade', 'scripts', 'images', 'fonts', 'video']);
gulp.task('default', ['build', 'watch', 'bs']);

// todo gulp 4 since
// todo update info file
// todo add ES2015
