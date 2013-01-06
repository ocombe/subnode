/**
 * Module dependencies.
 */

var express = require('express'),
	shows = require('./routes/shows'),
	http = require('http'),
	path = require('path'),
	fs = require('fs'),
	open = require('open'),
	args = process.argv.slice(2),
	nconf = require('nconf');

var appRouter = express();

appRouter.configure(function() {
	appRouter.set('port', process.env.PORT || 3000);
	appRouter.set('views', __dirname + '/views');
	appRouter.set('view engine', 'jade');
	appRouter.use(express.favicon());
	appRouter.use(express.bodyParser());
	appRouter.use(express.methodOverride());
	appRouter.use(appRouter.router);
	appRouter.use(express.static(path.join(__dirname, 'public')));
});

appRouter.configure('development', function() {
	appRouter.use(express.errorHandler());
	appRouter.use(express.logger('dev'));
});

appRouter.set('env', args[0] ? args[0] : "production");

appRouter.configure('production', function() {
	appRouter.use(express.errorHandler());
});

var server = http.createServer(appRouter).listen(appRouter.get('port'), function() {
	console.log("Server listening on port " + appRouter.get('port') + '. Watching folder "' + args[0] + '" - Opening browser...');

	nconf.use('file', { file: './config.json' });
	nconf.load();

	var baseFolder = nconf.get('baseFolder');
	if(baseFolder) {
		shows.init(this, baseFolder, function() {
			appRouter.get('/', shows.showList);
			appRouter.get(/^\/show\/([^\/]+)\/?(\d+)?\/?(\d+)?\/?$/, shows.episodes);
		});
	} else {
		appRouter.get('/', shows.config);
		shows.init(this, function(baseFolder) {
			delete appRouter._router.map.get;
			appRouter._router.map.get = [];
			appRouter.get('/', shows.showList);
			appRouter.get(/^\/show\/([^\/]+)\/?(\d+)?\/?(\d+)?\/?$/, shows.episodes);
			nconf.set('baseFolder', baseFolder);
			nconf.save();
		});
	}
	if(appRouter.get('env') == 'production') {
		open('http://localhost:' + appRouter.get('port'));
	}
});