var request = require('request'),
	http = require('http'),
	path = require('path'),
	fs = require('fs'),
	AdmZip = require('adm-zip'),
    fileScraper = require('./scraper.js'),
	natural = require('natural'),
    betaSeriesApiKey = '0bc44794dd9b';

exports.serialize = function(obj, prefix) {
    var str = [];
    for(var p in obj) {
        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
        str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
    return str.join("&");
}

exports.getFromApi = function(path, params, callback) {
    if(typeof params.key == 'undefined') {
        params.key = betaSeriesApiKey;
    }
    request({uri: 'http://api.betaseries.com/' + path + '.json?' + exports.serialize(params)}, function(err, response, body) {
        if(err && response.statusCode !== 200) {
            console.log('Request error: ' + response.statusCode, err);
        }
        if(typeof callback == 'function') {
            callback(JSON.parse(body));
        }
    });
}

exports.getShowUrl = function(showName, callback) {
	showName = showName.replace(/:/g, '');
	exports.getFromApi('/shows/search', {title: showName}, function(data) {
        if(typeof callback == 'function') {
	        var matches = [],
		        shows = data.root.shows;
	        for(var i in shows) {
		        matches.push({url: shows[i].url, value: natural.JaroWinklerDistance(shows[i].title,showName)});
		        matches.push({url: shows[i].url, value: natural.JaroWinklerDistance(shows[i].url,showName)}); // sometimes url is closer than title (ex: CSI)
	        }
	        matches.sort(function(a, b) {
		        return b.value - a.value;
	        });
            callback(matches[0].url);
        }
    });
}

exports.getSubtitles = function(fileInfo, lang, show, callback) {
	if(typeof show == 'function' && typeof callback == 'undefined') {
		callback = show;
		show = undefined;
	}
	exports.getShowUrl(show ? show : fileInfo.show, function(showUrl) {
		exports.getFromApi('/subtitles/show/' + showUrl, {
            language: lang,
            season: fileInfo.season,
            episode: fileInfo.episode
        }, function(data) {
			var subtitles = data.root.subtitles;
			for(var i in subtitles) {
				var tempContent = [];
				for(var s in subtitles[i].content) {
					if(subtitles[i].content[s]) {
						var subInfo = fileScraper.scrape(subtitles[i].content[s]);
						subInfo.score = fileScraper.score(fileInfo, subInfo, lang);
						tempContent.push(subInfo);
					}
				}
				subtitles[i].content = tempContent.sort(function(a, b) { return b.score - a.score; });
			}
            if(typeof callback == 'function') {
                callback(subtitles);
            }
        });
    });
}

exports.download = function(url, folder, subtitle, newName, callback) {
	var request = http.get(url.replace('https', 'http'), function(response) {
		var data = [],
			dataLen = 0,
			fileName = response.headers['content-disposition'],
			downloadedFile = path.basename(fileName.substring(fileName.indexOf('"') + 1, fileName.lastIndexOf('"')));
		response.on('data',function(chunk) {
			data.push(chunk);
			dataLen += chunk.length;
		}).on('end', function() {
				if(path.extname(downloadedFile) == '.zip') {
					var buf = new Buffer(dataLen);
					for(var i = 0, len = data.length, pos = 0; i < len; i++) {
						data[i].copy(buf, pos);
						pos += data[i].length;
					}
					var zip = new AdmZip(buf);
					zip.extractEntryTo(subtitle, folder, false, true);
					if(newName) {
						fs.rename(folder + subtitle, folder + newName);
					}
				} else {
					if(newName) {
						response.pipe(fs.createWriteStream(folder + newName));
					} else {
						response.pipe(fs.createWriteStream(folder + downloadedFile.replace(/\:\\\/\*\"\<\>\|/g, '')));
					}
				}
				if(typeof callback == 'function') {
					callback(true);
				}
			});
	});
}