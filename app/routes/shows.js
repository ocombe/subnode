var fs = require('fs'),
	path = require('path'),
	wrench = require('wrench'),
	fileScraper = require('../scraper.js'),
	addic7ed = require('../addic7ed.js'),
	betaSeries = require('../betaSeries.js'),
	sb = require('sickbeard'),
	async = require('async'),
	snParams;

var getShows = function(callback) {
	if(snParams.sickbeardUrl != '' && snParams.sickbeardApiKey != '') {
		sickbeard.api('shows', function(result) {
			var shows = [];
			for(var id in result.data) {
				var show = result.data[id];
				show.id = id;
				shows.push(show);
			}
			shows = shows.sort(function(a, b) {
				return a.show_name < b.show_name ? -1 : 1;
			});
			callback(null, shows);
		});
	} else if(snParams.baseFolder != '') {
		fs.readdir(snParams.baseFolder, function(err, folders) {
			var shows = [];
			for(var i in folders) {
				shows.push({
					id: folders[i],
					show_name: folders[i]
				});
			}
			callback(null, shows);
		});
	}
}

exports.init = function(server, params, callback) {
	var everyone = require("now").initialize(server);
	everyone.now.getSubs = function(showName, episode, returnSubs, allFinished) {
		var fileInfo = fileScraper.scrape(episode);
		async.parallel([
			function(callback){
				betaSeries.getSubtitles(fileInfo, 'VF', showName, function(results) {
					returnSubs(results, 'BetaSeries');
					callback(null);
				});
			},
			function(callback){
				addic7ed.getSubtitles(fileInfo, 'VF', showName, function(results) {
					returnSubs(results, 'Addic7ed');
					callback(null);
				});
			}
		], function(err, results){
			allFinished();
		});
	}
	everyone.now.download = function(url, folder, subtitle, callback) {
		if(url.indexOf('betaseries') != -1) {
			betaSeries.download(url, folder, subtitle, callback);
		} else if(url.indexOf('addic7ed') != -1) {
			addic7ed.download(url, folder, subtitle, callback);
		}
	};
	everyone.now.saveParams = function(params) {
		snParams = params;
		if(params.sickbeardUrl != '' && params.sickbeardApiKey != '') {
			sickbeard = new sb(params.sickbeardUrl, params.sickbeardApiKey);
		}
		callback(params);
	};
	if(typeof params == 'function' && typeof callback == 'undefined') {
		callback = params;
	} else {
		snParams = params;
		if(params.sickbeardUrl != '' && params.sickbeardApiKey != '') {
			sickbeard = new sb(params.sickbeardUrl, params.sickbeardApiKey);
		}
		if(typeof callback == 'function') {
			callback();
		}
	}
}

exports.config = function(req, res) {
	res.render('init', {
		title: 'subNode',
		currentUrl: '/',
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
		],
		parent: 'init',
		snParams: {}
	});
}

exports.showList = function(req, res) {
	getShows(function(err, shows) {
		res.render('index', {
			title: 'subNode',
			currentUrl: '/',
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
			],
			shows: shows,
			snParams: snParams
		});
	});
};

exports.episodes = function(req, res) {
	var showId = req.params[0],
		renderPage = function(showName, seasons, episodes, shows) {
			res.render('show', {
				title: showName,
				currentUrl: '/show/' + showId,
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
				],
				showFiles: episodes,
				seasons: seasons,
				shows: shows,
				showId: showId,
				snParams: snParams
			});
		};

	if(snParams.sickbeardUrl != '' && snParams.sickbeardApiKey != '') {
		async.parallel([
			getShows,
			function(callback) {
				sickbeard.api('show', {
					tvdbid: showId
				}, function(result) {
					callback(null, result);
				})
			},
			function(callback) {
				sickbeard.api('show.seasons', {
					tvdbid: showId,
					full: 1
				}, function(result) {
					callback(null, result);
				})
			}
		], function(err, results) {
			// processing show
			var showData = results[1].data;
			var seasons = showData.season_list.sort(function(a, b) {
					return a - b;
				}),
				episodes = {},
				subtitles = {},
				showName = showData.show_name,
				filesList = wrench.readdirSyncRecursive(showData.location);
			for(var i in filesList) {
				var fileInfo = fileScraper.scrape(showData.location + '/' + filesList[i]);
				if(fileInfo) { // if video or subtitle
					if(fileInfo.type == 'video') {
						if(typeof episodes[fileInfo.season] == 'undefined') {
							episodes[fileInfo.season] = {};
						}
						episodes[fileInfo.season][fileInfo.episode] = fileInfo;
					} else if(fileInfo.type == 'subtitle') {
						if(typeof subtitles[fileInfo.season] == 'undefined') {
							subtitles[fileInfo.season] = {};
						}
						subtitles[fileInfo.season][fileInfo.episode] = fileInfo;
					}
				}
			}

			// processing show seasons
			var epData = results[2].data;
			for(var season in epData) {
				for(var episode in epData[season]) {
					epData[season][episode].name = showName + ' - ' + season + 'x' + (episode < 10 ? '0' + episode : episode) + ' - ' + epData[season][episode].name + ' [' + epData[season][episode].status + ']';
					if(typeof episodes[season] != 'undefined' && typeof episodes[season][episode] != 'undefined') {
						epData[season][episode].file = episodes[season][episode].file;
						epData[season][episode].subtitle = typeof subtitles[season] != 'undefined' && typeof subtitles[season][episode] != 'undefined' ? subtitles[season][episode] : undefined;
						epData[season][episode].name = episodes[season][episode].name;
					}
				}
			}

			renderPage(showName, seasons, epData, results[0]);
		});
	} else if(snParams.baseFolder != '') {
		var filesList = wrench.readdirSyncRecursive(snParams.baseFolder + showId),
			seasons = [],
			episodes = {},
			subtitles = {};
		for(var i in filesList) {
			var fileInfo = fileScraper.scrape(snParams.baseFolder + showId + '/' + filesList[i]);
			if(fileInfo) { // if video or subtitle
				if(fileInfo.type == 'video') {
					if(typeof episodes[fileInfo.season] == 'undefined') {
						episodes[fileInfo.season] = [];
						seasons.push(fileInfo.season);
					}
					episodes[fileInfo.season].push(fileInfo);
				} else if(fileInfo.type == 'subtitle') {
					if(typeof subtitles[fileInfo.season] == 'undefined') {
						subtitles[fileInfo.season] = [];
					}
					subtitles[fileInfo.season].push(fileInfo);
				}
			}
		}
		// tri des saisons
		seasons.sort(function(a, b) {
			return a - b;
		});
		// tri des épisodes par numéro
		for(var i in episodes) {
			episodes[i] = episodes[i].sort(function(a, b) {
				return a.episode - b.episode;
			});
			for(var e in episodes[i]) {
				for(var s in subtitles[i]) {
					if(episodes[i][e].episode == subtitles[i][s].episode) {
						episodes[i][e].subtitle = subtitles[i][s];
					}
				}
			}
		}
		getShows(function(err, shows) {
			renderPage(showId, seasons, episodes, shows);
		});
	}
};

exports.getBanner = function(req, res) {
	var showId = req.params.showid;
	sickbeard.api('show.getbanner', {
		tvdbid: showId
	}, function(result) {
		res.redirect(result);
	});
}

exports.history = function(req, res) {
	async.parallel([
		getShows,
		function(callback) {
			sickbeard.api('history', function(result) {
				callback(null, result);
			});
		}
	], function(err, results) {
		res.render('history', {
			title: 'SickBeard History',
			currentUrl: '/history',
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
			],
			episodes: results[1].data,
			snParams: snParams,
			shows: results[0]
		});
	});
}