module.exports = {
	startServer: function() {
		var express = require('express'),
			app = express(),
            http = require('http').Server(app),
            io = require('socket.io')(http),
            errorHandler = require('errorhandler'),
            compression = require('compression'),
            bodyParser = require('body-parser'),
            //logger = require('morgan'),
			nconf = require('nconf'),
			nconfParams = new nconf.Provider().file('config', __dirname + '/../appParams.json'),
			fs = require('fs'),
			request = require('request'),
			path = require('path'),
			fileScraper = require(__dirname + '/scraper'),
			addic7ed = require(__dirname + '/addic7ed'),
			betaSeries = require(__dirname + '/betaSeries'),
			api = require(__dirname + '/api'),
			wrench = require('wrench'),
            chokidar = require(__dirname + '/chokidarWatcher'),
			_ = require('lodash'),
			updater = require(__dirname + '/updater'),
            Datastore = require('nedb'),
            filesList = new Datastore({ filename: __dirname + '/data/filesList.db', autoload: true }),
			lastUpdateCheck = 0,
            initialScanDone = false,
			upToDate,
            watcher;

        var watchEnabled = true; // for dev

        filesList.ensureIndex({ fieldName: 'file', unique: true });

		var appParams = {};

		var authenticate = function(req, res, next) {
			if(!appParams || !appParams.username || appParams.username == '' || !appParams.password || appParams.password == '') {
				next();
				return;
			}
			if(req.header('Authorization')) {
				var auth = new Buffer(req.header('Authorization').replace('Basic ', ''), 'base64').toString('ascii').split(':');
				req.username = auth[0];
				req.password = auth[1];
			}
			if(req.username == appParams.username && req.password == appParams.password) {
				next();
			} else {
				res.header('WWW-Authenticate', 'Basic realm="Access restricted"');
                res.sendStatus(401);
			}
		};

        app.use(errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
        //app.use(logger(':method :url'));
        app.use(compression());
        app.use(authenticate);
        app.use(express.static(path.resolve(__dirname + "/../public")));
        app.use(express.static(path.resolve(__dirname + "/../node_modules")));
        app.use(bodyParser.json());

		app.get('/api/params', function(req, response) {
			return response.json(appParams);
		});

		app.post('/api/params', function(req, response) {
            var initialRoot = appParams.rootFolder;
			appParams = req.body;
			nconfParams.set("rootFolder", appParams.rootFolder);
			nconfParams.set("autorename", appParams.autorename);
			nconfParams.set("autorename_ext", appParams.autorename_ext);
			nconfParams.set("subLang", appParams.subLang);
			nconfParams.set("username", appParams.username);
			nconfParams.set("password", appParams.password);
			nconfParams.set("providers", appParams.providers);
			nconfParams.save(function(err) {
                if(initialRoot !== appParams.rootFolder) {
                    filesList.remove({}, { multi: true }, function(err, numRemoved) {
                        if(err) {
                            console.log(err);
                        }
                        startWatch();
                    });
                }
                response.status(err ? 500 : 200).json({error: err, success: err ? false : true});
			});
		});

		app.get('/api/checkUpdate', function(req, response) {
			var now = new Date().getTime();
			if(now - lastUpdateCheck <= 6 * 60 * 60 * 1000) { // 1 check / 6h
				return response.json(upToDate);
			} else {
				updater.checkVersion(function(res) {
					lastUpdateCheck = new Date().getTime();
					upToDate = res;
					return response.json(res);
				});
			}
		});

		app.get('/api/update', function(req, response) {
			updater.update(function(res) {
				response.json(res);
				if(res.success) {
					console.log('Update complete, restarting server');
					process.exit(3331);
				}
			});
		});

		app.get('/api/showList/:full?', function(req, response) {
			if(appParams && appParams.rootFolder) {
                // todo use chokidar for following calls
				fs.readdir(path.resolve(appParams.rootFolder), function(err, folders) {
                    if(err) {
                        console.error(err);
                    }
                    folders = folders ? folders.sort() : [];

                    if(req.params.full) { // get all info
                        // todo add tv db info
                        var tvShows = {};
                        _.each(folders, function(showId) {
                            tvShows[showId] = {showId: showId, episodes: {}, subtitles: {}};
                        });

                        filesList.find({}, function(err, curFiles) {
                            _.each(curFiles, function(fileInfo) {
                                var showId = fileInfo.file.replace(appParams.rootFolder + '/', "");
                                showId = showId.substr(0, showId.indexOf("/"));
                                // todo cleanup showId ?
                                if(fileInfo.type == 'video') {
                                    tvShows[showId].episodes[fileInfo.season + "x" + fileInfo.episode] = fileInfo;
                                } else if(fileInfo.type == 'subtitle') {
                                    tvShows[showId].subtitles[fileInfo.season + "x" + fileInfo.episode] = fileInfo;
                                }
                            });

                            _.each(tvShows, function(show) {
                                show.episodes = _.keys(show.episodes);
                                show.subtitles = _.keys(show.subtitles);
                                var subCount = 0;
                                // only count subtitles that match an episode
                                _.each(show.episodes, function(ep) {
                                   if(show.subtitles.indexOf(ep) !== -1) {
                                       subCount++;
                                   }
                                });
                                show.episodes = show.episodes.length;
                                show.subtitles = subCount;
                            });

                            return response.json(_.values(tvShows));
                        });
                    } else {
                        return response.json(folders);
                    }
				});
			} else {
				return response.json([]);
			}
		});

		app.get('/api/show/:showId/:force', function(req, response) {
			if(appParams.rootFolder != '') {
				var episodes = {},
					subtitles = {},
					episodesList = [];

                function addFile(fileInfo) {
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

                function sortFiles() {
                    // sort episodes by number & season
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
                        episodesList.push({
                            season: parseInt(i, 10),
                            episodes: episodes[i]
                        });
                    }
                }

                function onEpisodes() {
                    sortFiles();

                    api.getShow(req.params.showId).then(function(res) {
                        return response.json({success: true, data: {
                            showInfo: res.show,
                            seasons: episodesList
                        }});
                    }, function() {
                        return response.json({success: true, data: {
                            seasons: episodesList
                        }});
                    })
                }

                if(watchEnabled && initialScanDone && !req.params.force) {
                    filesList.find({show: req.params.showId}, function(err, curFiles) {
                        _.each(curFiles, function(fileInfo) {
                            addFile(fileInfo);
                        });

                        onEpisodes();
                    });
                } else {
                    filesList.remove({show: req.params.showId}, {multi: true}, function(err, docs) {
                        wrench.readdirRecursive(appParams.rootFolder + '/' + req.params.showId, function(error, curFiles) {
                            if(typeof curFiles === 'undefined') {
                                return response.json([]);
                            } else if(curFiles !== null) {
                                _.each(curFiles, function(file) {
                                    var fileInfo = fileScraper.scrape(appParams.rootFolder + '/' + req.params.showId + '/' + file);

                                    if(fileInfo) { // if video or subtitle
                                        var fileStats = fs.statSync(path.resolve(appParams.rootFolder, fileInfo.file));
                                        fileInfo.ctime = fileStats.ctime.getTime();

                                        filesList.update({file: fileInfo.file}, fileInfo, {upsert: true}, function(err) {
                                            if(err) {
                                                console.log(err);
                                            }
                                        });

                                        addFile(fileInfo);
                                    }
                                });
                            } else { // we have all files
                                onEpisodes();
                            }
                        });
                    });
                }
			}
		});

		app.get('/api/betaSeries/:showId/:episode', function(req, response) {
			betaSeries.getSubtitles({
				fileInfo: fileScraper.scrape(req.params.episode),
				lang: appParams.subLang,
				showId: req.params.showId
			}).then(function(subtitles) {
				return response.json({success: true, data: subtitles});
			}, function(err) {
                return response.json({success: false, error: err});
            });
		});

		app.get('/api/addic7ed/:showId/:episode', function(req, response) {
			addic7ed.getSubtitles({
				fileInfo: fileScraper.scrape(req.params.episode),
				lang: appParams.subLang,
				showId: req.params.showId
			}).then(function(subtitles) {
				return response.json({success: true, data: subtitles});
			}, function(err) {
                return response.json({success: false, error: err});
            });
		});

		app.post('/api/download', function(req, response) {
            function download(folder, url, episode, subtitle) {
                var newName = false; // send false for no autorename
                if(appParams.autorename) {
                    newName = path.basename(episode.name).replace(path.extname(episode.name), (appParams.autorename_ext ? '.' + appParams.subLang : '') + path.extname(subtitle))
                }

                function onDownload(err, path) {
                    if(!err) {
                        var fileInfo = fileScraper.scrape(path);
                        // if video or subtitle
                        if(fileInfo) {
                            var stats = fs.statSync(path);
                            if(stats && stats.ctime) {
                                fileInfo.ctime = new Date(stats.ctime).getTime();
                            }
                            // replace the subtitle for this show / season / episode
                            filesList.update({
                                type: fileInfo.type,
                                season: fileInfo.season,
                                episode: fileInfo.episode,
                                show: fileInfo.show
                            }, fileInfo, {upsert: true});
                        }
                        return response.json({success: true, data: fileInfo});
                    } else {
                        return response.json({success: false, error: err});
                    }
                }

                if(url.indexOf('betaseries') !== -1) {
                    betaSeries.download({
                        url: url,
                        folder: folder,
                        subtitle: subtitle,
                        newName: newName
                    }, onDownload);
                } else if(url.indexOf('addic7ed') !== -1) {
                    addic7ed.download({
                        url: url,
                        folder: folder,
                        newName: newName
                    }, onDownload);
                }
            }

            var folder = path.dirname(req.body.episode.file) + '/';
            if(req.body.subtitle && req.body.url) {
                download(folder, req.body.url, req.body.episode, req.body.subtitle);
            } else { // one click download
                var promisesList = [];
                if(appParams.providers.indexOf('addic7ed') !== -1) {
                    promisesList.push(addic7ed.getSubtitles({
                        fileInfo: fileScraper.scrape(req.body.episode.name),
                        lang: appParams.subLang,
                        showId: req.body.episode.show
                    }));
                }
                if(appParams.providers.indexOf('betaSeries') !== -1) {
                    promisesList.push(betaSeries.getSubtitles({
                        fileInfo: fileScraper.scrape(req.body.episode.name),
                        lang: appParams.subLang,
                        showId: req.body.episode.show
                    }));
                }
                Promise.all(promisesList).then(function(res) {
                    var subtitlePacks = _.flatten(res);
                    var subtitles = _.flatten(_.map(subtitlePacks, function(subPack) {
                        return _.each(subPack.content, function(sub) {
                            sub.score = subPack.quality * sub.score;
                            sub.url = subPack.url;
                        });
                    }));
                    if(subtitles.length > 0) {
                        var selectedSubtitle = _.max(subtitles, 'score');
                        download(folder, selectedSubtitle.url, req.body.episode, selectedSubtitle.file);
                    } else {
                        return response.json({success: false, error: 'No subtitle found'});
                    }
                }, function(err) {
                    return response.json({success: false, error: err});
                });
            }
		});

		app.get('/api/lastEpisodes', function(req, response) {
            if(appParams.rootFolder) {
                filesList.find({type: 'video'}, function(err, files) {
                    var lastEpisodes = [];

                    files = files.sort(function(a, b) {
                        return b.ctime - a.ctime;
                    });

                    _.each(files, function(file) {
                        if(lastEpisodes.length < 10) {
                            file.showId = file.file.replace(/\\/g, '/').replace(appParams.rootFolder.replace(/\\/g, '/') + '/', '');
                            file.showId = file.showId.substr(0, file.showId.indexOf('/'));
                            lastEpisodes.push(file);
                        } else {
                            return false; // exit loop
                        }
                    });

                    return response.json(lastEpisodes);
                });
            } else {
                return response.json([]);
            }
		});

		app.get('/api/image/:type/:showName/:size', function(req, response) {
            var size = req.params.size,
                type = req.params.type;
			api.getImage({
				path: __dirname + '/../public/img/'+type+'/',
				showName: req.params.showName,
                type: type,
                size: size
			}).then(function(path) {
				fs.createReadStream(path).pipe(response);
			}, function(err) {
                fs.createReadStream(path.resolve(__dirname + "/../public/img/generic_" + type + ".jpg")).pipe(response);
            });
		});

		app.get('/api/info/:showName/:lang', function(req, response) {
			api.getFullShowInfo({showName: req.params.showName, lang: req.params.lang}, function(err, data) {
				return response.json(data);
			});
		});

		app.get('/api/exit', function(req, response) {
			response.send('The server has been shut down.');
			process.exit(3330);
		});

        app.get('/', function(req, response) {
            return response.sendFile(path.resolve(__dirname + '/../public/index.html'));
        });

        // socket.io
        io.on('connection', function(socket){
            //console.log('a user connected');

            /*socket.on('disconnect', function(){
                console.log('user disconnected');
            });*/

            socket.on('scan:status', function() {
                socket.emit('scan:status', initialScanDone ? 'done' : 'pending');
            })
        });

        function startWatch() {
            if(watcher) {
                watcher.close();
            }

            if(watchEnabled && appParams && appParams.rootFolder) {
                initialScanDone = false;
                // Initialize watcher
                watcher = chokidar.watch(appParams.rootFolder, {
                    ignored: /[\/\\]\./,
                    persistent: true,
                    awaitWriteFinish: true
                    //ignoreInitial: true
                });

                var emitNewScan = _.debounce(function() {
                    io.emit('scan:new');
                }, 2000);

                var tempFiles = [];

                function onFileChange(path, stats) {
                    var fileInfo = fileScraper.scrape(path);
                    // if video or subtitle
                    if(fileInfo && (fileInfo.type === 'video' || fileInfo.type === 'subtitle')) {
                        if(stats && stats.ctime) {
                            fileInfo.ctime = new Date(stats.ctime).getTime();
                        }
                        if(tempFiles) {
                            tempFiles.push(fileInfo);
                        } else {
                            filesList.update({file: fileInfo.file}, fileInfo, {upsert: true}, function(err) {
                                if(err) {
                                    console.log(err);
                                }
                            });
                        }
                        if(initialScanDone) {
                            emitNewScan();
                        }
                    }
                }

                // Add event listeners
                watcher
                    .on('add', onFileChange)
                    .on('change', onFileChange)
                    .on('unlink', function(path) {
                        filesList.remove({path: path})
                    })
                    .on('error', function(error) {
                        console.log('Error happened', error);
                    })
                    .on('ready', function() {
                        filesList.remove({}, {multi: true}, function(err) {
                            if(err) {
                                console.log(err);
                            } else {
                                filesList.insert(tempFiles, function(err) {
                                    tempFiles = undefined;
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        initialScanDone = true;
                                        console.log('Initial scan complete. Ready for changes.');
                                        filesList.persistence.compactDatafile(); // compress the db
                                        emitNewScan();
                                    }
                                })
                            }
                        });
                    });
            }
        }

        return nconfParams.load(function() {
			appParams = {
				rootFolder: nconfParams.get('rootFolder'),
				sickbeardUrl: nconfParams.get('sickbeardUrl'),
				sickbeardApiKey: nconfParams.get('sickbeardApiKey'),
				autorename: nconfParams.get('autorename'),
				autorename_ext: nconfParams.get('autorename_ext'),
				subLang: nconfParams.get('subLang'),
				username: nconfParams.get('username'),
				password: nconfParams.get('password'),
				providers: nconfParams.get('providers'),
				port: nconfParams.get('port')
			};

			return http.listen(appParams.port || process.env.PORT || 3000, function() {
				if(!appParams.port) {
					nconfParams.set("port", process.env.PORT || 3000);
					nconfParams.save(function(err) {
						if(err) throw err;
					});
				}

                startWatch();

				return console.log("Listening on port " + (appParams.port || process.env.PORT || 3000) + ". Go to http://localhost:" + (appParams.port || process.env.PORT || 3000) + "/ and enjoy !");
			});
		});
	}
};
