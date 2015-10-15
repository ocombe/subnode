var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    importOnce = require('node-sass-import-once'), // allow css imports in sass
    del = require('del'),
    typescript = require('gulp-typescript'),
    browserSync = require('browser-sync').create(),
    spawn = require('child_process').spawn,
    batch = require('gulp-batch');

var PATHS = {
    ts: './src/**/*.ts',
    sass: './src/scss/**/*.scss',
    typings: './typings/tsd.d.ts',
    html: './public/**/*.html',
    server: './server/**/*.js'
};

gulp.task(clean);
gulp.task(sass2css);
gulp.task(ts2js);
gulp.task(watch);
gulp.task('default', gulp.series(clean, gulp.parallel(ts2js, sass2css)));
gulp.task(dev);
gulp.task('run', gulp.series('default', dev));


/* Define our tasks using plain functions */
function ts2js() {
    var tsResult = gulp.src([PATHS.ts, PATHS.typings])
        .pipe(typescript({
            noImplicitAny: true,
            module: 'system',
            target: 'ES5',
            emitDecoratorMetadata: true,
            experimentalDecorators: true
        }));

    return tsResult.js.pipe(gulp.dest('public'))
        .pipe(browserSync.stream());
}

function clean() {
    // You can use multiple globbing patterns as you would with `gulp.src`
    // If you are using del 2.0 or above, return its promise
    return del(['public/app']);
}

function spawnServer() {
    var server = spawn('node', ['./server/serverWrapper.js'], {
        detached: true
    });

    server.stdout.on('data', function(data) {
        console.log('' + data);
    });

    server.stderr.on('data', function(data) {
        console.log('' + data);
    });

    server.unref();

    return server;
}

// Rerun the task when a file changes
function watch(server) {

    gulp.watch(PATHS.ts, batch(function(events, done) {
        gulp.series(ts2js)(done);
    }));
    gulp.watch(PATHS.sass, batch(function(events, done) {
        gulp.series(sass2css)(done);
    }));
    gulp.watch(PATHS.html, browserSync.reload);
    if(typeof server !== 'undefined') {
        gulp.watch(PATHS.server, function() {
            console.log('Restarting server');
            server.kill();
            server = spawnServer();
        });
    }
}

function sass2css() {
    return gulp.src("src/scss/*.scss")
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

}

function dev(done) {
    var server = spawnServer();

    browserSync.init({
        proxy: 'localhost:3000',
        port: 9000,
        open: false
    });

    process.stdin.resume();//so the program will not close instantly

    function exitHandler(options, err) {
        if(err) {
            console.error(err.stack);
        }
        if(options.exit) {
            done();
            server.kill(); // kill the server as well
            process.exit();
        }
    }

    //do something when app is closing
    process.on('exit', exitHandler.bind(null, {exit: true}));

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit: true}));

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, {exit: true}));

    return watch(server);
}
