var nconf = require('nconf'),
    _ = require('lodash'),
    Trakt = require('trakt-api'),
    trakt = Trakt("34e0e7989e7f4f7fbe15b0d47dc195e4d7ecdd2a68dc912405e393f03e195782", {
        extended: "full,images" // basic info + images
    }),
    wrench = require('wrench'),
    request = require('request'),
    fs = require('fs'),
    path = require('path'),
    Datastore = require('nedb'),
    showDataFile = new Datastore({filename: __dirname + '/data/trackt.db', autoload: true}),
    currentPromises = {};

var cache = {
    get: function(showName) {
        return new Promise(function(resolve, reject) {
            showDataFile.findOne({showName: showName}, function(err, data) {
                if(err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },

    set: function(showName, data) {
        return new Promise(function(resolve, reject) {
            showDataFile.update({showName: showName}, {
                $set: data
            }, {upsert: true}, function(err, docs) {
                if(err) {
                    reject(err);
                } else {
                    resolve(docs);
                }
            });
        });
    }
};

var getShow = function(showName) {
    return cache.get(showName).then(function(res) {
        if(res && res.show && res.show.seasons) {
            return res;
        } else {
            // todo remove year from the name and filter with it
            var yearRegexp = /\s\(?\d{4}\)?/;
            var yearTest = yearRegexp.exec(showName);
            if(yearTest !== null) {
                yearTest = yearTest[0];
                showName = showName.replace(yearTest, '');
                yearTest = yearTest.replace(/\W/g, '');
            }
            if(!currentPromises[showName]) {
                currentPromises[showName] = trakt.search(showName, 'show', yearTest ? Number(yearTest) : undefined);
            }
            return currentPromises[showName].then(function(res) {
                if(res.length > 0) {
                    return trakt.show(res[0].show.ids.trakt).then(function(show) {
                        if(show) {
                            return trakt.showSeasons(show.ids.trakt, {extended: 'episodes'}).then(function(res) {
                                if(res) {
                                    show.seasons = res;
                                    var data = {
                                        showName: showName,
                                        show: show
                                    };
                                    return cache.set(showName, data).then(function(r) {
                                        return data;
                                    });
                                } else {
                                    return null;
                                }
                            });
                        }
                    });
                } else {
                    return null;
                }
            }, function(err) {
                console.log(err);
                return err;
            });
        }
    })
};

exports.getImage = function(params) {
    return new Promise(function(resolve, reject) {
        var filename = path.resolve(params.path, params.showName + '.jpg');
        fs.exists(filename, function(exists) {
            if(exists) {
                resolve(filename);
            } else {
                getShow(params.showName).then(function(res) {
                    var imgUrl = _.get(res, ['show', 'images', [params.type], 'full']);
                    if(imgUrl) {
                        wrench.mkdirSyncRecursive(params.path, '0777');
                        var stream = request(imgUrl).on('end', function() {
                            resolve(filename);
                        });
                        stream.pipe(fs.createWriteStream(filename));
                    } else {
                        reject();
                    }
                }, reject);
            }
        });
    })
};

exports.getShow = getShow;
/*
 exports.getFullShowInfo = function(params) {
 return exports.getBaseShowInfo(params.showName).then(function(showInfo) {
 return getDataFromFile(params.showName).then(function(dataFile) {
 var lastUpdate = dataFile ? dataFile.lastUpdate : false,
 now = new Date().getTime();
 if(showInfo.language !== params.lang || !lastUpdate || (now - lastUpdate >= 24 * 60 * 60 * 1000)) { // update if older than 24h
 tvdb = new TVDB(TvDbApiKey, params.lang);
 return tvdb.getSeriesAllById(showInfo.id).then(function(data) {
 data.lastUpdate = now;
 data.showName = params.showName;
 showDataFile.update({showName: params.showName}, {$set: data}, {upsert: true});
 return data;
 });
 } else {
 return {
 tvShow: showInfo,
 episodes: dataFile.episodes
 };
 }
 });
 });
 };
 */
