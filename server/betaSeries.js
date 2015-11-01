var request = require('request'),
	http = require('http'),
	path = require('path'),
	fs = require('fs'),
	AdmZip = require('adm-zip'),
    fileScraper = require(__dirname + '/scraper.js'),
	natural = require('natural'),
    betaSeriesApiKey = '0bc44794dd9b',
	async = require('async'),
	_ = require('lodash');

exports.serialize = function(obj, prefix) {
    var str = [];
    for(var p in obj) {
        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
        str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
    return str.join("&");
};

exports.getFromApi = function(path, params, callback) {
    if(typeof params.key == 'undefined') {
        params.key = betaSeriesApiKey;
    }
    request({uri: 'http://api.betaseries.com/' + path + '.json?' + exports.serialize(params)}, function(err, response, body) {
        if(!response || (err && response.statusCode !== 200)) {
            return callback('Request error.');
        }
        if(typeof callback == 'function') {
            callback(JSON.parse(body));
        }
    });
};

exports.getShowUrl = function(showName, callback) {
	showName = showName.replace(/:/g, '');
	exports.getFromApi('/shows/search', {title: showName}, function(data) {
        if(typeof callback == 'function') {
	        var matches = [],
		        shows = data.root.shows,
		        afterCb = function(res) {
			        _.each(res, function(r) {
				        matches.push({url: r.url, value: natural.JaroWinklerDistance(r.title,showName)});
				        matches.push({url: r.url, value: natural.JaroWinklerDistance(r.url,showName)}); // sometimes url is closer than title (ex: CSI)
			        });
			        matches.sort(function(a, b) {
				        return b.value - a.value;
			        });
			        callback(matches.length > 0 ? matches[0].url : false);
		        };
	        if(typeof shows[0] === 'undefined') {
		        async.map(showName.split(' '), function(name, cb) {
			        exports.getFromApi('/shows/search', {title: name}, function(data) {
				        cb(null, data.root.shows);
			        });
		        }, function(err, results){
			        var shows = [];
			        _.each(results, function(res) {
				        _.each(res, function(r) {
					        shows.push(r);
				        });
			        });
			        afterCb(shows)
		        });
	        } else {
		        afterCb(shows);
	        }
        }
    });
};

exports.getSubtitles = function(params, callback) {
	if(typeof params.showId == 'function' && typeof callback == 'undefined') {
		callback = params.showId;
		params.showId = undefined;
	}
	exports.getShowUrl(params.showId ? params.showId : params.fileInfo.show, function(showUrl) {
		if(showUrl) {
			exports.getFromApi('/subtitles/show/' + showUrl, {
	            language: params.lang === 'fr' ? 'VF' : 'VO',
	            season: params.fileInfo.season,
	            episode: params.fileInfo.episode
	        }, function(data) {
				var tempSubtitles = data.root.subtitles,
					subtitles = [];
				_.each(tempSubtitles, function(sub) {
					var tempContent = [];
					_.each(sub.content, function(content) {
						if(content) {
							var subInfo = fileScraper.scrape(content);
							if(subInfo && subInfo.season == params.fileInfo.season && subInfo.episode == params.fileInfo.episode && (!subInfo.lang || subInfo.lang == params.lang)) {
								subInfo.score = fileScraper.score(params.fileInfo, subInfo, params.lang);
								tempContent.push(subInfo);
							}
						}
					});
					if(tempContent.length > 0) {
						sub.content = tempContent.sort(function(a, b) { return b.score - a.score; });
                        sub.season = Number(sub.season);
                        sub.episode = Number(sub.episode);
						subtitles.push(sub);
					} else {
						delete sub;
					}
				});
	            if(typeof callback == 'function') {
	                callback(subtitles);
	            }
	        });
		} else if(typeof callback == 'function') {
			callback([]);
		}
    });
};

exports.download = function(params, callback) {
    var request = http.get(params.url.replace('https', 'http'), function(response) {
        if(!response || response.statusCode !== 200) {
            return callback('Request error.');
        }
        var data = [],
            dataLen = 0,
            fileName = response.headers['content-disposition'],
            downloadedFile = path.basename(fileName.substring(fileName.indexOf('"') + 1, fileName.lastIndexOf('"')));
        response.on('data', function(chunk) {
            data.push(chunk);
            dataLen += chunk.length;
        }).on('end', function() {
            var newFile = '';
            if(path.extname(downloadedFile) == '.zip') {
                var buf = new Buffer(dataLen);
                for(var i = 0, len = data.length, pos = 0; i < len; i++) {
                    data[i].copy(buf, pos);
                    pos += data[i].length;
                }
                var zip = new AdmZip(buf);
                zip.extractEntryTo(params.subtitle, params.folder, false, true);
                if(params.newName) {
                    newFile = params.folder + params.newName;
                    fs.renameSync(params.folder + path.basename(params.subtitle), newFile);
                } else {
                    newFile = params.folder + params.subtitle;
                }
                if(typeof callback == 'function') {
                    callback(null, newFile);
                }
            } else {
                if(params.newName) {
                    newFile = params.folder + params.newName;
                    response.pipe(fs.createWriteStream(newFile));
                } else {
                    newFile = params.folder + downloadedFile.replace(/\:\\\/\*\"\<\>\|/g, '');
                    response.pipe(fs.createWriteStream(newFile));
                }
                response.on('close', function() {
                    if(typeof callback == 'function') {
                        callback(null, newFile);
                    }
                });
            }
        });
    });
};
