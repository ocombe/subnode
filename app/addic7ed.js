var request = require('request'),
	http = require('http'),
	fs = require('fs'),
	fileScraper = require('./scraper.js'),
	jsdom = require('jsdom');

exports.getShowId = function(showName, start, callback) {
	var uri = 'http://www.google.com/search?q=' + (start == true ? encodeURIComponent(showName + ' site:www.addic7ed.com/show/') : encodeURIComponent('addic7ed ' + showName) + '&start='+start);
	request({uri: uri}, function(err, response, body) {
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
			$('#search div#ires ol li.g div.s cite').each(function() {
				if($(this).text().indexOf('www.addic7ed.com/show/') != -1) {
					url = $(this).text();
				}
			});
			var url = $('#search div#ires ol li.g div.s cite:first').text();
			if(url.indexOf('www.addic7ed.com/show/') != -1) {
				var id = url.substr(url.lastIndexOf('/') + 1, url.length);
				if(typeof callback == 'function') {
					callback(id);
				}
			} else if(start == true || start < 100) {
				exports.getShowId(showName, start == true ? 0 : start + 10, callback);
			} else {
				if(typeof callback == 'function') {
					callback(false);
				}
			}
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

	exports.getShowId(show ? show : fileInfo.show, true, function(id) {
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

exports.download = function(url, folder, subtitle, callback) {
	var request = http.get({
		hostname: 'www.addic7ed.com',
		headers: {
			referer: 'http://www.addic7ed.com'
		},
		port: 80,
		path: url.substr(23, url.length)
	}, function(response) {
		var success = false;
		var fileName = response.headers['content-disposition'];
		if(fileName) {
			fileName = fileName.substring(fileName.indexOf('"') + 1, fileName.lastIndexOf('"'));
			response.pipe(fs.createWriteStream(folder + '/' + fileName));
			success = true;
		}
		if(typeof callback == 'function') {
			callback(success);
		}
	});
}