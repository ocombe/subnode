var nconf = require('nconf'),
	_ = require('lodash'),
	TVDB = require('./tvdb_lib.js'),
	tvdb = new TVDB({apiKey: "66BBEB48D4C7D155"}),
	wrench = require('wrench'),
	request = require('request'),
	fs = require('fs'),
	tvdbMirrors,
	Datastore = require('nedb'),
	showDataFile = new Datastore({ filename: __dirname + '/data/thetvdb.db', autoload: true });

var getDataFromFile = function(showName, callback) {
	showDataFile.findOne({ showName: showName }, function (err, data) {
		callback(err, data);
	});
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
						wrench.mkdirSyncRecursive(params.path, '0777');
						var stream = request(bannerUrl).on('end', function() {
							callback(filename);
						});
						stream.pipe(fs.createWriteStream(filename));
					} else {
						callback(false);
					}
				});
			};
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
};

exports.getBaseShowInfo = function(showName, callback) {
	getDataFromFile(showName, function(err, dataFile) {
		if(err) {
			return callback(err);
		}
		var showInfo = dataFile ? dataFile.tvShow : false;
		if(!showInfo) {
			tvdb.findTvShow(showName, function(err, data) {
				if(err) return;
				if(data && data.length > 0) {
					showDataFile.update({ showName: showName }, { $set: { tvShow: data[0], showName: showName } }, { upsert: true }, function (err, numReplaced, upsert) {
						callback(err, data[0]);
					});
				} else {
					callback('Unable to find ' + showName + ' in the TVDB database');
				}
			});
		} else {
			callback(null, showInfo);
		}
	})
};

exports.getFullShowInfo = function(params, callback) {
	exports.getBaseShowInfo(params.showName, function(err, showInfo) {
		if(err) {
			callback(err);
		} else {
			getDataFromFile(params.showName, function(err, dataFile) {
				if(err) {
					return callback(err);
				}
				var lastUpdate = dataFile ? dataFile.lastUpdate : false,
					now = new Date().getTime();
				if(showInfo.language !== params.lang || !lastUpdate || (now - lastUpdate >= 24 * 60 * 60 * 1000)) { // update if older than 24h
					tvdb.getInfo(showInfo.id, function(err, data) {
						if(err) {
							callback(err);
						} else {
							data.lastUpdate = now;
							data.showName = params.showName;
							showDataFile.update({ showName: params.showName }, { $set: data }, { upsert: true }, function (err, numReplaced, upsert) {
								callback(err, data);
							});
						}
					}, params.lang);
				} else {
					callback(null, {
						tvShow: showInfo,
						episodes: dataFile.episodes
					});
				}
			});
		}
	});
};
