var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    importOnce = require('node-sass-import-once'), // allow css imports in sass
    del = require('del'),
    typescript = require('gulp-typescript'),
    browserSync = require('browser-sync').create(),
    spawn = require('child_process').spawn,
    batch = require('gulp-batch'),
    install = require("gulp-install"),
    fs = require('fs'),
    path = require('path'),
    targets;

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
gulp.task('default', gulp.series(clean, gulp.parallel(vendor, ts2js, sass2css)));
gulp.task(dev);
gulp.task('run', gulp.series('default', dev));
gulp.task(vendor);
gulp.task('npm', gulp.series(npmInstall, npmInstall, npmInstall, npmInstall, npmInstall, npmInstall));
gulp.task('build', gulp.series(build, 'npm'));
gulp.task('binaries', windowsInstaller);


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
    return del(['public/app', 'public/js']);
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
            includePaths: [
                'node_modules/bootstrap/scss',
                'node_modules/bourbon/app/assets/stylesheets/'
            ],
            outputStyle: 'compressed',
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
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("./public/css"))
        .pipe(browserSync.stream({match: '**/*.css'}));

}

function dev(done) {
    var server = spawnServer();

    browserSync.init({
        proxy: 'localhost:3000',
        port: 9000,
        open: false,
        ws: true
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

function vendor() {
    var uglify = require('gulp-uglify'),
        concat = require('gulp-concat');

    return gulp.src([
            'node_modules/systemjs/dist/system.src.js',
            'node_modules/angular2/bundles/angular2.min.js',
            'node_modules/angular2/bundles/router.dev.min.js',
            'node_modules/angular2/bundles/http.min.js',
            'node_modules/lodash/index.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('vendor.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/js/'));
}

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(path.join(srcpath, file)).isDirectory();
    });
}

function npmInstall(done) {
    if(typeof targets === 'undefined') {
        targets = getDirectories('./releases');
    }
    if(targets.length > 0) {
        var target = targets.shift();
        return gulp.src('./releases/' + target + '/resources/app/package.json')
            .pipe(gulp.dest('./releases/' + target + '/resources/app/'))
            .pipe(install({
                production: true,
                ignoreScripts: true
            }));
    } else if(done) {
        done();
    }
}

function build(done) {
    var packager = require('electron-packager');
    var package = require('./package.json');
    packager({
        dir: './',
        name: 'subnode',
        //platform: 'all',
        platform: 'win32',
        //arch: 'all',
        arch: 'ia32',
        out: './releases/',
        overwrite: true,
        icon: './public/img/favicon.ico',
        prune: true, // remove npm dev dependencies
        version: '0.34.2',
        'app-version': package.version,
        ignore: [
            '.idea',
            'appParams.json',
            'src',
            'banners',
            'media',
            '.editorconfig',
            'typings',
            'tsconfig.json',
            'tsd.json',
            'gulpfile.js',
            'releases',
            '.gitignore',
            'node_module'
        ]
    }, function() {
        targets = getDirectories('./releases');
        done();
    })
}

function windowsInstaller(done) {
    var createInstaller = require('electron-installer-squirrel-windows');
    createInstaller({
        name: "subnode",
        product_name: "Subnode",
        loading_gif: './public/img/subnode.gif',
        description: "An app to easily get subtitles for your tv shows",
        path: './releases/subnode-win32-ia32',
        out: './releases',
        setup_icon: './public/img/favicon.ico'
    }, done);
}
