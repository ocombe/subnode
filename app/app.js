/**
 * Module dependencies.
 */

var express = require('express'),
	shows = require('./routes/shows'),
	login = require('./routes/login'),
	http = require('http'),
	path = require('path'),
	fs = require('fs'),
	open = require('open'),
	args = process.argv.slice(2),
	nconf = require('nconf'),
	passport = require('passport');

var appRouter = express();

appRouter.configure(function() {
	login.init(passport);
	appRouter.set('port', process.env.PORT || 3000);
	appRouter.set('views', __dirname + '/views');
	appRouter.set('view engine', 'jade');
	appRouter.use(express.favicon());
	appRouter.use(express.cookieParser());
	appRouter.use(express.bodyParser());
	appRouter.use(express.session({ secret: 'REED6hGqdqGbrMvA5p78DOXpA4S9UAb8JWAe24nP7li+TS+raL' }));
	appRouter.use(express.methodOverride());
	appRouter.use(passport.initialize());
	appRouter.use(passport.session());
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
	console.log("Server listening on port " + appRouter.get('port') + " - Opening browser...");

	nconf.use('file', { file: __dirname + '/../config.json' });
	nconf.load();

	var params = {
		baseFolder: nconf.get('baseFolder'),
		sickbeardUrl: nconf.get('sickbeardUrl'),
		sickbeardApiKey: nconf.get('sickbeardApiKey')
	}

	if((typeof params.baseFolder != 'undefined' && params.baseFolder != '') || (typeof params.sickbeardUrl != 'undefined' && typeof params.sickbeardApiKey != 'undefined' && params.sickbeardUrl != '' && params.sickbeardApiKey != '')) {
		shows.init(this, params, defineRoutes);
	} else {
		appRouter.get('/', shows.config);
		shows.init(this, function(params) {
			defineRoutes(params);
		});
	}
	if(appRouter.get('env') == 'production') {
		open('http://localhost:' + appRouter.get('port'));
	}
});

var defineRoutes = function(params) {
	if(params) {
		nconf.set('username', params.username);
		nconf.set('password', params.password);
		nconf.set('sickbeardUrl', params.sickbeardUrl);
		nconf.set('sickbeardApiKey', params.sickbeardApiKey);
		nconf.set('baseFolder', params.baseFolder);
		nconf.save();
	}
	delete appRouter._router.map.get;
	appRouter._router.map.get = [];
	appRouter.post('/login',
		passport.authenticate('local', {
			successRedirect: '/',
			failureRedirect: '/login'
		})
	);
	appRouter.get('/login', login.login);
	appRouter.get('/', function(req, res) { login.checkLogin(req, res, shows.showList) });
	appRouter.get(/^\/show\/([^\/]+)\/?(\d+)?\/?(\d+)?\/?$/, function(req, res) { login.checkLogin(req, res, shows.episodes) });
	appRouter.get('/banner/:showid', shows.getBanner);
	appRouter.get('/history', function(req, res) { login.checkLogin(req, res, shows.history) });
}