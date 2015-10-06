var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    importOnce = require('node-sass-import-once'), // allow css imports in sass
    browserSync = require('browser-sync').create();

var PATHS = {
    src: 'src/**/*.ts',
    typings: 'typings/tsd.d.ts'
};

gulp.task('ts2js', function() {
    var typescript = require('gulp-typescript');
    var tsResult = gulp.src([PATHS.src, PATHS.typings])
        .pipe(plumber())
        .pipe(typescript({
            noImplicitAny: true,
            module: 'system',
            target: 'ES5',
            emitDecoratorMetadata: true,
            experimentalDecorators: true
        }));

    return tsResult.js.pipe(gulp.dest('public'))
        .pipe(browserSync.stream());
});

gulp.task('sass', function() {
    var sass = require('gulp-sass');

    return gulp.src("src/scss/*.scss")
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            importer: importOnce
        }))
        .pipe(autoprefixer({ // auto generate browser special prefixes
            browsers: [
                "last 2 version",
                "> 1%", // browsers with > 1% usage
                "ie >= 10"
            ],
            cascade: false
        }))
        .pipe(minifyCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("./public/css"))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

var spawnServer = function() {
    var spawn = require('child_process').spawn;

    var server = spawn('node', ['./server/serverWrapper.js'], {
        detached: true
    });

    server.stdout.on('data', function (data) {
        console.log('' + data);
    });

    server.stderr.on('data', function (data) {
        console.log('' + data);
    });

    server.unref();

    return server;
};

gulp.task('dev', ['default'], function() {
    var server = spawnServer();

    browserSync.init({
        proxy: 'localhost:3000',
        port: 9000,
        open: false
    });

    gulp.watch(PATHS.src, ['ts2js']);
    gulp.watch("src/scss/**/*.scss", ['sass']);
    gulp.watch("./public/**/*.html").on('change', browserSync.reload);
    gulp.watch('./server/**/*.js').on('change', function() {
        console.log('Restarting server');
        server.kill();
        server = spawnServer();
    })
});

gulp.task('default', ['ts2js', 'sass']);
