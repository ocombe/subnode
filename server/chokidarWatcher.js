'use strict'

var fork = require('child_process').fork;
var EE = require('events').EventEmitter;
var inherits = require('util').inherits;
var p = require('path');
var forever = require('forever-monitor');

function nop() {
}

function Watcher(path, opts) {
    if(!(this instanceof Watcher)) {
        return new Watcher(path, opts);
    }

    this.path = path;
    this.opts = opts;

    this._startChild();
}

inherits(Watcher, EE);

Watcher.prototype._startChild = function() {
    var that = this;

    if(this.child) {
        return;
    }

    this.child = new (forever.Monitor)(__dirname + '/chokidarChild.js', {fork: true});

    this.child.on('message', function(msg) {
        if(msg.path) { // for other events than error & ready
            that.emit(msg.event, msg.path, msg.stats);
            that.emit('all', msg.event, msg.path, msg.stats);
        } else {
            that.emit(msg.event, msg.error);
        }
    });

    this.child.on('error', nop);

    function exitHandler(options, err) {
        if(err) {
            console.error(err.stack);
        }
        if(options.exit) {
            // stop the child
            that.child.stop();
            that.child.kill();
            process.exit(0);
        }
    }

    // do something when app is closing
    process.on('exit', exitHandler.bind(null, {exit: true}));

    // catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit: true}));
    process.on('SIGTERM', exitHandler.bind(null, {exit: true}));
    // terminal closed
    process.on('SIGUP', exitHandler.bind(null, {exit: true}));

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, {exit: true}));

    this.child.start();

    this.child.send({
        path: this.path,
        opts: this.opts
    });
}

Watcher.prototype.close = function(cb) {
    if(this.child) {
        this.closing = true
        if(cb) {
            this.child.on('exit', cb);
        }

        var that = this
        setImmediate(function() {
            that.child.kill();
        });
    } else if(cb) {
        setImmediate(cb);
    }
}

module.exports.watch = Watcher;
