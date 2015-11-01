System.register([], function(exports_1) {
    var SocketService;
    return {
        setters:[],
        execute: function() {
            SocketService = (function () {
                function SocketService() {
                }
                SocketService.on = function (evt, callback) {
                    if (typeof callback !== 'function') {
                        throw new Error('You need to define a callback to listen to events');
                    }
                    return SocketService.socket.on(evt, zone.bind(function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i - 0] = arguments[_i];
                        }
                        callback.apply(null, args);
                    }));
                };
                SocketService.off = function (evt) {
                    return SocketService.socket.off(evt);
                };
                SocketService.socket = io();
                return SocketService;
            })();
            exports_1("SocketService", SocketService);
        }
    }
});
