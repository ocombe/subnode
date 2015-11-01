'use strict'

var watch = require('chokidar').watch;

process.once('message', function(msg) {
    var watcher = watch(msg.path, msg.opts)

    watcher.on('all', function(event, path, stats) {
        process.send({event: event, path: path, stats: stats})
    });

    watcher.on('ready', function(event, path) {
        process.send({event: 'ready'})
    });

    watcher.on('error', function(error) {
        process.send({event: 'error', error: error})
    });
});

process.on('error', function() {
});

process.on('disconnect', function() {
    process.exit();
});
