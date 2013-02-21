var auth = require('http-auth'),
	username,
	password,
	basic;

exports.init = function(user, pass) {
	username = user;
	password = pass;
	basic = auth({
		authRealm : "Access Restricted",
		authList : [username + ':' + password]
	});
}

exports.checkLogin = function(req, res, callback) {
	if((!username && !password) || (username == '' && password == '')) {
		callback(req, res);
	} else {
		basic.apply(req, res, function(username) {
			callback(req, res);
		});
	}
}