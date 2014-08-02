var request = require('request'),
	http = require('http'),
	fs = require('fs'),
	fileScraper = require('./scraper.js'),
	cheerio = require('cheerio'),
	nconf = require('nconf'),
	nconfParams = new nconf.Provider().file('config', __dirname + '/../appParams.json'),
	Datastore = require('nedb'),
	db = {},
	natural = require('natural'),
	_ = require('lodash'),
	showListData,
	additionalData,
	lastUpdate;

db.showListData = new Datastore({ filename: __dirname + '/data/addic7ed.db', autoload: true });
db.additionalData = new Datastore({ filename: __dirname + '/data/addic7ed_plus.db', autoload: true });

nconfParams.load(function() {
	db.showListData.find({}, function(err, docs) {
		showListData = docs;
	});
	additionalData = db.additionalData.find({}, function(err, docs) {
		additionalData = docs;
	});
	lastUpdate = nconfParams.get('lastAddic7edUpdate');
});

exports.getShowId = function(showName, callback) {
	var checkNames = function(data, retry) {
		var matches = [];
		for(var i = 0, len = data.length; i < len; i++) {
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
		if(matches.length === 0 && retry === 1 && showListData) {
			checkNames(showListData, 2);
		} else if((matches.length > 0 && matches[0].value > 0.8) || retry) { // todo: propose the 5 top names
			callback(matches.length > 0 ? matches[0].id : null);
		} else { // else, new show ? update the show list
			getShowList(function(newData) {
				if(newData != data) {
					checkNames(data, 1);
				} else {
					callback(matches[0].id);
				}
			});
		}
	};
	if(showListData && (new Date()).getTime() - lastUpdate <= 60 * 60 * 24) {
		checkNames(showListData);
	} else {
		getShowList(checkNames);
	}
}

var getShowList = function(callback) {
	request({uri: 'http://www.addic7ed.com/ajax_getShows.php'}, function(err, response, body) {
		//Just a basic error check
		if(!response || (err && response.statusCode !== 200)) {
			return callback([]);
		}
		var $ = cheerio.load(body),
			data = [];
		$('#qsShow option').each(function() {
			data.push({
				id: $(this).attr('value'),
				name: $(this).text()
			});
		});
		_.each(additionalData, function(a) {
			data.push(a);
		});
		data.shift(); // remove "[Select a TV Show]" line

		// replace showListData
		db.showListData.remove({}, {multi: true}, function (err, numRemoved) {
			db.showListData.insert(data);
		});

		lastUpdate = (new Date()).getTime();
		nconfParams.set('lastAddic7edUpdate', lastUpdate);
		nconfParams.save();

		showListData = data;
		callback(data);
	});
}


var getSubtitlesList = function(params, callback) {
	var aLang;
	switch(params.lang) {
		case 'fr':
			aLang = 8;
			break;
		case 'nl':
			aLang = 17;
			break;
		default:
			aLang = 1; // english
			break;
	}
	request({uri: 'http://www.addic7ed.com/ajax_loadShow.php?show=' + params.id + '&season=' + params.fileInfo.season + '&langs=|' + aLang + '|&hd=0&hi=0'}, function(err, response, body) {
		var self = this;
		//Just a basic error check
		if(!response || err) {
			console.log('Request error.');
			return callback([]);
		}
		var $ = cheerio.load(body),
			subs = [];
		$('div#season tbody tr.epeven.completed').each(function(i, row) {
			var columns = $(row).find('td');
			if($(columns[1]).text() == params.fileInfo.episode && $(columns[3]).text() == params.langFull && $(columns[5]).text() == 'Completed') {
				var fileName = params.showId + ' - ' + params.fileInfo.season + 'x' + (params.fileInfo.episode < 10 ? '0' + params.fileInfo.episode : params.fileInfo.episode) + ' - ' + $(columns[4]).text() + '.' + $(columns[3]).text() + '.srt';
				var subInfo = fileScraper.scrape(fileName);
				subInfo.score = fileScraper.score(params.fileInfo, subInfo, params.lang);
				subs.push({
					title: fileName,
					season: params.fileInfo.season,
					episode: params.fileInfo.episode,
					language: params.lang,
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
}

exports.getSubtitles = function(params, callback) {
	var langFull = 'English';
	if(typeof params.showId == 'function' && typeof callback == 'undefined') {
		callback = params.showId;
		params.showId = undefined;
	}
	if(params.lang == 'fr') {
		langFull = 'French';
	}
	if(params.lang == 'nl') {
		langFull = 'Dutch';
	}

	exports.getShowId(params.showId ? params.showId : params.fileInfo.show, function(id) {
		if(id) {
			getSubtitlesList({
				id: id,
				showId: params.showId ? params.showId : params.fileInfo.show,
				lang: params.lang,
				langFull: langFull,
				fileInfo: params.fileInfo
			}, function(data) {
				if(typeof callback == 'function') {
					callback(data);
				}
			});
		} else {
			if(typeof callback == 'function') {
				callback('Error: no id for tv show.');
			}
		}
	});
}

exports.download = function(params, callback) {
	var request = http.get({
		hostname: 'www.addic7ed.com',
		headers: {
			referer: 'http://www.addic7ed.com'
		},
		port: 80,
		path: params.url.substr(23, params.url.length)
	}, function(response, err) {
		if(!response ||(err && response.statusCode !== 200)) {
			return callback('Request error.');
		}
		var success = false;
		var fileName = response.headers['content-disposition'];
		if(fileName) {
			if(params.newName) {
				response.pipe(fs.createWriteStream(params.folder + params.newName));
			} else {
				fileName = fileName.substring(fileName.indexOf('"') + 1, fileName.lastIndexOf('"')).replace(/[\:\\\/\*\"\<\>\|]/g, '');
				response.pipe(fs.createWriteStream(params.folder + fileName));
			}
			success = true;
		}
		if(typeof callback == 'function') {
			callback(null, success);
		}
	});
}