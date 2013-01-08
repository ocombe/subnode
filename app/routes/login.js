var nconf = require('nconf'),
	LocalStrategy = require('passport-local').Strategy;

exports.init = function(passport) {
	passport.use(new LocalStrategy(
		function(username, password, done) {
			if(username.valueOf() === nconf.get('username') && password.valueOf() === nconf.get('password')) {
				return done(null, {username: username, password: password});
			} else {
				return done(null, false, { message: 'Incorrect username or password.' });
			}
		}
	));
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		done(null, user);
	});
}

exports.login = function(req, res) {
	res.render('login', {
		title: 'subNode',
		stylesheets: [
			'/css/bootstrap.css',
			'/css/bootstrap-responsive.css',
			'/css/bootmetro.css',
			'/css/bootmetro-tiles.css',
			'/css/bootmetro-charms.css',
			'/css/metro-ui-dark.css',
			'/css/icomoon.css',
			'/css/style.css',
			'/css/show.css'
		],
		scripts: [
			'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js',
			'/nowjs/now.js',
			'/js/modernizr-2.6.2.min.js',
			'/js/bootstrap.min.js',
			'/js/bootmetro.js',
			'/js/bootmetro-charms.js',
			'/js/show.js'
		]
	});
}

exports.checkLogin = function(req, res, callback) {
	var username = nconf.get('username');
	var password = nconf.get('password');
	if((!username && !password) || (username == '' && password == '') || (req.session.passport && (req.session.passport.user && req.session.passport.user.username == username && req.session.passport.user.password == password))) {
		callback(req, res);
	} else {
		res.redirect('/login');
	}
}