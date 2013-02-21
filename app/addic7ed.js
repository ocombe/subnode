var request = require('request'),
	http = require('http'),
	fs = require('fs'),
	fileScraper = require('./scraper.js'),
	jsdom = require('jsdom'),
	async = require('async'),
	nconf = require('nconf').file('addic7ed', __dirname + '/data/addic7ed.db'),
	natural = require('natural'),
	showListData,
	additionalData;

nconf.load(function() {
	showListData = nconf.get('showListData');
	additionalData = nconf.get('additional');
});


exports.getShowId = function(showName, callback) {
	var checkNames = function(data, retry) {
		var matches = [];
		for(var i in data) {
			if(data[i].name == showName) {
				callback(data[i].id, 'match');
				return;
			} else {
				matches.push({id: data[i].id, value: natural.JaroWinklerDistance(data[i].name, showName)});
			}
		}
		matches.sort(function(a, b) {
			return b.value - a.value;
		});
		if(matches[0].value > 0.8 || retry) {
			callback(matches[0].id);
		} else { // else, new show ? update the show list
			getShowList(function(newData) {
				if(newData != data) {
					checkNames(data, true);
				} else {
					callback(matches[0].id);
				}
			});
		}
	};
	if(showListData) {
		checkNames(showListData);
	} else {
		getShowList(checkNames);
	}
}

var getShowList = function(callback) {
	request({uri: 'http://www.addic7ed.com/ajax_getShows.php'}, function(err, response, body) {
		//Just a basic error check
		if(err && response.statusCode !== 200) {
			throw('Request error.');
		}
		//Send the body param as the HTML code we will parse in jsdom
		//also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
		jsdom.env({
			html: body,
			scripts: ['https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js']
		}, function(err, window) {
			var $ = window.jQuery,
				data = [];
			$('#qsShow option').each(function() {
				data.push({
					id: $(this).attr('value'),
					name: $(this).text()
				});
			});
			for(var i in additionalData) {
				data.push(additionalData[i]);
			}
			nconf.set('showListData', data);
			showListData = data;
			nconf.save();
			callback(data);
		});
	});
}


var getSubtitlesList = function(id, show, lang, fileInfo, callback) {
	request({uri: 'http://www.addic7ed.com/ajax_loadShow.php?show=' + id + '&season=' + fileInfo.season + '&langs=|' + lang + '|&hd=0&hi=0'}, function(err, response, body) {
		var self = this;
		//Just a basic error check
		if(err && response.statusCode !== 200) {
			console.log('Request error.');
		}
		//Send the body param as the HTML code we will parse in jsdom
		//also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
		jsdom.env({
			html: body,
			scripts: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js']
		}, function(err, window) {
			var $ = window.jQuery;
			var subs = [];
			var rows = $('div#season tbody tr.epeven.completed').each(function(i, row) {
				var columns = $(row).find('td');
				if(columns[1].innerHTML == fileInfo.episode && columns[5].innerHTML == 'Completed') {
					var fileName = show + ' - ' + fileInfo.season + 'x' + (fileInfo.episode < 10 ? '0' + fileInfo.episode : fileInfo.episode) + ' - ' + $(columns[4]).text() + '.' + $(columns[3]).text() + '.srt';
					var subInfo = fileScraper.scrape(fileName);
					subInfo.score = fileScraper.score(fileInfo, subInfo, lang);
					subs.push({
						title: fileName,
						season: fileInfo.season,
						episode: fileInfo.episode,
						language: lang == 8 ? 'VF' : 'VO',
						source: 'addic7ed',
						file: fileName,
						url: 'http://www.addic7ed.com' + $(columns[9]).find('a').first().attr('href'),
						quality: 3,
						content: [
							subInfo
						]
					});
				}
			});
			if(typeof callback == 'function') {
				callback(subs);
			}
		});
	});
}

exports.getSubtitles = function(fileInfo, lang, show, callback) {
	if(typeof show == 'function' && typeof callback == 'undefined') {
		callback = show;
		show = undefined;
	}
	if(lang == 'VF') {
		lang = 8;
	} else {
		lang = 1; // english
	}

	exports.getShowId(show ? show : fileInfo.show, function(id) {
		if(id) {
			getSubtitlesList(id, show ? show : fileInfo.show, lang, fileInfo, function(data) {
				if(typeof callback == 'function') {
					callback(data);
				}
			});
		} else {
			if(typeof callback == 'function') {
				callback({});
			}
		}
	});
}

exports.download = function(url, folder, newName, callback) {
	var request = http.get({
		hostname: 'www.addic7ed.com',
		headers: {
			referer: 'http://www.addic7ed.com'
		},
		port: 80,
		path: url.substr(23, url.length)
	}, function(response, err) {
		var success = false;
		var fileName = response.headers['content-disposition'];
		if(fileName) {
			if(newName) {
				response.pipe(fs.createWriteStream(folder + newName));
			} else {
				fileName = fileName.substring(fileName.indexOf('"') + 1, fileName.lastIndexOf('"')).replace(/[\:\\\/\*\"\<\>\|]/g, '');
				response.pipe(fs.createWriteStream(folder + fileName));
			}
			success = true;
		}
		if(typeof callback == 'function') {
			callback(success);
		}
	});
}