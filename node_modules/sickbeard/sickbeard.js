var request = require('request');

module.exports = function(url, apiKey) {
	if(typeof url == 'undefined' || typeof apiKey == 'undefined') {
		throw "Url & apiKey are required !";
	}
	
	var serialize = function(obj, prefix) {
		var str = [];
		for(var p in obj) {
			var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
			str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
		}
		return str.join("&");
	}

	var req = function(cmd, params, callback) {
		if(typeof callback == 'undefined' && typeof params == 'function') {
			callback = params;
			params = undefined;
		}
		request({uri: url + '/api/' + apiKey + '/?cmd=' + cmd + (typeof params == 'object' ? '&' + serialize(params) : '')}, function(err, response, body) {
			if(typeof callback == 'function') {
				callback(JSON.parse(body));
			}
		});
	}

	return {
		api: function(cmd, params, callback) {
			req(cmd, params, callback);
		}
	};
}