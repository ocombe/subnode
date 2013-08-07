var nconf = require('nconf'),
	_ = require('lodash'),
	TVDB = require('./tvdb_lib.js'),
	tvdb = new TVDB({apiKey: "66BBEB48D4C7D155"}),
	wrench = require('wrench'),
	request = require('request'),
	fs = require('fs'),
	tvdbMirrors,
	dataFiles = [];

var getDataFile = function(name, callback) {
	if(!dataFiles[name]) {
		dataFiles[name] = new nconf.Provider().file(name, __dirname + '/data/shows/' + name + '.db');
		dataFiles[name].load(function() {
			callback(dataFiles[name]);
		});
	} else {
		callback(dataFiles[name]);
	}
}

exports.getMirrors = function(callback) {
	if(!tvdbMirrors) {
		tvdb.getMirrors(function(err, mirrors) {
			if(err) return;
			tvdbMirrors = mirrors;
			callback(tvdbMirrors);
		});
	} else {
		callback(tvdbMirrors);
	}
}

exports.getBanner = function(params, callback) {
	var filename = params.path + params.showName + '.jpg';
	fs.exists(filename, function(exists) {
		if(exists) {
			callback(filename);
		} else {
			var getBanner = function() {
				tvdb.findTvShow(params.showName, function(err, tvShows) {
					if(err) return;
					if(tvShows && tvShows.length > 0 && tvShows[0].banner) {
						var bannerUrl = tvdbMirrors[0].url + '/banners/' + tvShows[0].banner;
						wrench.mkdirSyncRecursive(params.path, 0777);
						var stream = request(bannerUrl).on('end', function() {
							callback(filename);
						});
						stream.pipe(fs.createWriteStream(filename));
					} else {
						callback(false);
					}
				});
			}
			if(!tvdbMirrors) {
				tvdb.getMirrors(function(err, mirrors) {
					if(err) return;
					tvdbMirrors = mirrors;
					getBanner();
				});
			} else {
				getBanner();
			}
		}
	});
}

exports.getBaseShowInfo = function(showName, callback) {
	getDataFile(showName, function(dataFile) {
		var showInfo = dataFile.get('tvShow');
		if(!showInfo) {
			tvdb.findTvShow(showName, function(err, data) {
				if(err) return;
				if(data && data.length > 0) {
					dataFile.set('tvShow', data[0]);
					dataFile.save(function(err) {
						callback(null, data[0]);
					});
				} else {
					callback('Unable to find ' + showName + ' in the TVDB database');
				}
			});
		} else {
			callback(null, showInfo);
		}
	})
}

exports.getFullShowInfo = function(params, callback) {
	exports.getBaseShowInfo(params.showName, function(err, showInfo) {
		if(err) {
			callback(err);
		} else {
			getDataFile(params.showName, function(dataFile) {
				var lastUpdate = dataFile.get('lastUpdate'),
					now = new Date().getTime();
				if(showInfo.language !== params.lang || !lastUpdate || (now - lastUpdate >= 24 * 60 * 60 * 1000)) { // update if older than 24h
					tvdb.getInfo(showInfo.id, function(err, data) {
						if(err) {
							callback(err);
						} else {
							dataFile.set('lastUpdate', now);
							_.each(data, function(value, key) {
								dataFile.set(key, value);
							});
							dataFile.save(function(err) {
								callback(err, data);
							});
						}
					}, params.lang);
				} else {
					callback(null, {
						tvShow: showInfo,
						episodes: dataFile.get('episodes')
					});
				}
			});
		}
	});
}