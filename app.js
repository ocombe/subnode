/**
 * Module dependencies.
 */

var express = require('express'),
	shows = require('./routes/shows'),
	http = require('http'),
	path = require('path'),
	fs = require('fs'),
	open = require('open'),
	args = process.argv.slice(2);

var app = express();

app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
	app.use(express.errorHandler());
	app.use(express.logger('dev'));
});

app.set('env', args[1] ? args[1] : "development");

app.configure('production', function() {
	app.use(express.errorHandler());
});

var server = http.createServer(app).listen(app.get('port'), function() {
	args[0] = args[0][args[0].length - 1] == '/' ? args[0] : args[0] + '/'; // add the last '/' if necessary
	console.log("Server listening on port " + app.get('port') + '. Watching folder "' + args[0] + '" - Opening browser...');
	shows.init(this, args[0], function() {
		app.get('/', shows.showList);
		app.get(/^\/show\/([^\/]+)\/?(\d+)?\/?(\d+)?\/?$/, shows.episodes);
	});
	if(app.get('env') == 'production') {
		open('http://localhost:' + app.get('port'));
	}
});