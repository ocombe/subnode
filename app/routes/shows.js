var fs = require('fs'),
	path = require('path'),
	wrench = require('wrench'),
	fileScraper = require('../scraper.js'),
	addic7ed = require('../addic7ed.js'),
	betaSeries = require('../betaSeries.js'),
	sb = require('sickbeard'),
	snParams;

var getSbShows = function(callback) {
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
		callback(shows);
	});
}

exports.init = function(server, params, callback) {
	var everyone = require("now").initialize(server);
	everyone.now.getSubs = function(showName, episode, callback) {
		betaSeries.getSubtitles(episode, 'VF', showName, callback);
		addic7ed.getSubtitles(episode, 'VF', showName, callback);
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
	var callback = function(shows) {
		res.render('index', {
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
			],
			shows: shows,
			snParams: snParams
		});
	}
	if(snParams.sickbeardUrl != '' && snParams.sickbeardApiKey != '') {
		getSbShows(callback);
	} else if(snParams.baseFolder != '') {
		fs.readdir(snParams.baseFolder, function(err, folders) {
			var shows = [];
			for(var i in folders) {
				shows.push({
					id: folders[i],
					show_name: folders[i]
				});
			}
			callback(shows);
		});
	}
};

exports.episodes = function(req, res) {
	var showId = req.params[0],
		callback = function(showName, seasons, episodes, shows) {
			res.render('show', {
				title: showName,
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
				snParams: snParams
			});
		};

	if(snParams.sickbeardUrl != '' && snParams.sickbeardApiKey != '') {
		getSbShows(function(shows) {
			sickbeard.api('show', {
				tvdbid: showId
			}, function(result) {
				var showData = result.data;
				var seasons = showData.season_list.sort(),
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
				sickbeard.api('show.seasons', {
					tvdbid: showId,
					full: 1
				}, function(result) {
					var epData = result.data;
					for(var season in epData) {
						for(var episode in epData[season]) {
							if(epData[season][episode].status == 'Downloaded' || epData[season][episode].status == 'Snatched') {
								epData[season][episode].name = season + 'x' + (episode < 10 ? '0' + episode : episode) + ' - ' + epData[season][episode].name;
								epData[season][episode].file = episodes[season][episode].file;
								epData[season][episode].subtitle = typeof subtitles[season] != 'undefined' && typeof subtitles[season][episode] != 'undefined' ? subtitles[season][episode] : undefined;
							} else {
								epData[season][episode].name = season + 'x' + (episode < 10 ? '0' + episode : episode) + ' - ' + epData[season][episode].name + ' [' + epData[season][episode].status + ']';
							}
						}
					}
					callback(showName, seasons, epData, shows);
				});
			});
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
		fs.readdir(snParams.baseFolder, function(err, shows) {
			callback(showId, seasons, episodes, shows);
		});
	}
};