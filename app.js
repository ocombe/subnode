/**
 * Module dependencies.
 */

var express = require('express'),
	shows = require('./app/scripts/shows'),
	login = require('./app/scripts/login'),
	http = require('http'),
	path = require('path'),
	fs = require('fs'),
	open = require('open'),
	args = process.argv.slice(2),
	nconf = require('nconf').file('config', __dirname + '/config.json');

var appRouter = express();

appRouter.configure(function() {
	appRouter.set('port', process.env.PORT || 3000);
	appRouter.set('views', __dirname + '/app/views');
	appRouter.set('view engine', 'jade');
	appRouter.use(express.favicon());
	appRouter.use(express.cookieParser());
	appRouter.use(express.bodyParser());
	appRouter.use(express.session({ secret: 'REED6hGqdqGbrMvA5p78DOXpA4S9UAb8JWAe24nP7li+TS+raL' }));
	appRouter.use(express.methodOverride());
	appRouter.use(express.static(path.join(__dirname, '/app/public')));
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
	console.log("Server listening on port " + appRouter.get('port') + " - Opening browser...");
	var self = this;
	nconf.load(function() {
		var params = {
			baseFolder: nconf.get('baseFolder'),
			sickbeardUrl: nconf.get('sickbeardUrl'),
			sickbeardApiKey: nconf.get('sickbeardApiKey'),
			autorename: nconf.get('autorename'),
			subLang: nconf.get('subLang'),
			username: nconf.get('username'),
			password: nconf.get('password')
		}

		login.init(params.username, params.password);

		if((typeof params.baseFolder != 'undefined' && params.baseFolder != '') || (typeof params.sickbeardUrl != 'undefined' && typeof params.sickbeardApiKey != 'undefined' && params.sickbeardUrl != '' && params.sickbeardApiKey != '')) {
			shows.init(self, params, defineRoutes);
		} else {
			appRouter.get('/', shows.config);
			shows.init(self, function(params) {
				defineRoutes(params);
			});
		}
		if(appRouter.get('env') == 'production') {
			open('http://localhost:' + appRouter.get('port'));
		}
	});
});

var defineRoutes = function(params) {
	if(params) {
		var keys = Object.keys(params);
		for(var i in keys) {
			nconf.set(keys[i], params[keys[i]]);
		}
		nconf.save();
		login.init(params.username, params.password);
	}
	appRouter.get('/', function(req, res) { login.checkLogin(req, res, shows.showList); });
	appRouter.get(/^\/show\/([^\/]+)\/?(\d+)?\/?(\d+)?\/?$/, function(req, res) { login.checkLogin(req, res, shows.episodes); });
	appRouter.get('/banner/:showid', shows.getBanner);
	appRouter.get('/history', function(req, res) { login.checkLogin(req, res, shows.history); });
	appRouter.get('/renameAll', function(req, res) { login.checkLogin(req, res, shows.renameAll ); })
}