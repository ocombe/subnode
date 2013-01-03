var fs = require('fs'),
	path = require('path'),
	wrench = require('wrench'),
	fileScraper = require('../scraper.js'),
	addic7ed = require('../addic7ed.js'),
	betaSeries = require('../betaSeries.js'),
	startingFolder;

exports.init = function(server, dir, callback) {
	startingFolder = dir;
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
	if(typeof callback == 'function') {
		callback();
	}
}

exports.showList = function(req, res) {
	fs.readdir(startingFolder, function(err, files) {
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
			shows: files
		});
	});
};

exports.episodes = function(req, res) {
	var showName = req.params[0],
		episodes = [],
		subtitles = [];
	fs.readdir(startingFolder + showName, function(err, files) {
		var filesList = wrench.readdirSyncRecursive(startingFolder + showName);
		for(var i in filesList) {
			var fileInfo = fileScraper.scrape(startingFolder + showName + '/' + filesList[i]);
			if(fileInfo) { // if video or subtitle
				if(fileInfo.type == 'video') {
					if(typeof episodes[fileInfo.season] == 'undefined') {
						episodes[fileInfo.season] = [];
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
		// tri des épisodes par numéro
		for(var i in episodes) {
			episodes[i] = episodes[i].sort(function(a, b) { return a.episode - b.episode; });
			for(var e in episodes[i]) {
				for(var s in subtitles[i]) {
					if(episodes[i][e].episode == subtitles[i][s].episode) {
						episodes[i][e].subtitle = subtitles[i][s];
					}
				}
			}
		}
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
			showFiles: episodes
		});
	});
};