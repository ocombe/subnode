module.exports = {
	startServer: function() {
		var express = require('express'),
			app = express(),
            http = require('http').Server(app),
            io = require('socket.io')(http),
            errorHandler = require('errorhandler'),
            compression = require('compression'),
            bodyParser = require('body-parser'),
            logger = require('morgan'),
			nconf = require('nconf'),
			nconfParams = new nconf.Provider().file('config', __dirname + '/../appParams.json'),
			fs = require('fs'),
			request = require('request'),
			path = require('path'),
			fileScraper = require(__dirname + '/scraper'),
			addic7ed = require(__dirname + '/addic7ed'),
			betaSeries = require(__dirname + '/betaSeries'),
			tvdb = require(__dirname + '/tvdb'),
			wrench = require('wrench'),
            chokidar = require(__dirname + '/chokidarWatcher'),
			_ = require('lodash'),
			updater = require(__dirname + '/updater'),
            Datastore = require('nedb'),
            filesList = new Datastore({ filename: __dirname + '/data/filesList.db', autoload: true }),
			lastUpdateCheck = 0,
            initialScanDone = false,
			upToDate;

        var watchEnabled = true;

        filesList.ensureIndex({ fieldName: 'file', unique: true });

		var appParams = {},
			lastEpisodes = [],
			lastFetch = 0;

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
        app.use(compression({filter: shouldCompress}))

        function shouldCompress(req, res) {
            return true;
        }
        app.use(authenticate);
        app.use(express.static(path.resolve(__dirname + "/../public")));
        app.use(express.static(path.resolve(__dirname + "/../node_modules")));
        app.use(bodyParser.json());

		app.get('/api/params', function(req, response) {
			return response.json(appParams);
		});

		app.post('/api/params', function(req, response) {
			appParams = req.body;
			nconfParams.set("rootFolder", appParams.rootFolder);
			nconfParams.set("autorename", appParams.autorename);
			nconfParams.set("autorename_ext", appParams.autorename_ext);
			nconfParams.set("subLang", appParams.subLang);
			nconfParams.set("username", appParams.username);
			nconfParams.set("password", appParams.password);
			nconfParams.set("providers", appParams.providers);
			nconfParams.save(function(err) {
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

		app.get('/api/showList', function(req, response) {
			if(appParams && appParams.rootFolder) {
                // todo use chokidar for following calls
				fs.readdir(path.resolve(appParams.rootFolder), function(err, folders) {
                    if(err) {
                        console.error(err);
                    }
					return response.json(folders ? folders.sort() : []);
				});
			} else {
				return response.json([]);
			}
		});

		app.get('/api/show/:showId', function(req, response) {
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

                if(watchEnabled && initialScanDone) {
                    filesList.find({show: req.params.showId}, function(err, curFiles) {
                        _.each(curFiles, function(fileInfo) {
                            addFile(fileInfo);
                        });

                        sortFiles();
                        return response.json(episodesList);
                    });
                } else {
                    wrench.readdirRecursive(appParams.rootFolder + '/' + req.params.showId, function(error, curFiles) {
                        if(typeof curFiles === 'undefined') {
                            return response.json([]);
                        } else if(curFiles !== null) {
                            _.each(curFiles, function(file) {
                                var fileInfo = fileScraper.scrape(appParams.rootFolder + '/' + req.params.showId + '/' + file);
                                if(fileInfo) { // if video or subtitle
                                    addFile(fileInfo);
                                }
                            });
                        } else { // we have all files
                            sortFiles();
                            return response.json(episodesList);
                        }
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
                    //todo update filesList
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
                    var selectedSubtitle = _.max(subtitles, 'score');
                    download(folder, selectedSubtitle.url, req.body.episode, selectedSubtitle.file);
                }, function(err) {
                    return response.json({success: false, error: err});
                });
            }
		});

		app.get('/api/lastEpisodes', function(req, response) {
            lastEpisodes = [];
            if(appParams.rootFolder) {
                filesList.find({type: 'video'}, function(err, files) {
                    files = files.sort(function(a, b) {
                        return b.ctime - a.ctime;
                    });

                    _.each(files, function(file) {
                        if(lastEpisodes.length < 10) {
                            file.showId = file.file.replace(appParams.rootFolder + '/', '');
                            file.showId = file.showId.substr(0, file.showId.indexOf('/'));
                            lastEpisodes.push(file);
                        } else {
                            return false;
                        }
                    });

                    return response.json(lastEpisodes);
                });
            } else {
                return response.json([]);
            }
		});

		app.get('/api/banner/:showName', function(req, response) {
			tvdb.getBanner({
				path: __dirname + '/../banners/',
				showName: req.params.showName
			}, function(path) {
				fs.createReadStream(path || __dirname + "/../public/img/generic_banner.jpg").pipe(response);
			});
		});

		app.get('/api/info/:showName/:lang', function(req, response) {
			tvdb.getFullShowInfo({showName: req.params.showName, lang: req.params.lang}, function(err, data) {
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

                if(watchEnabled) {
                    // Initialize watcher
                    var watcher = chokidar.watch(appParams.rootFolder, {
                        ignored: /[\/\\]\./,
                        persistent: true,
                        awaitWriteFinish: true
                        //ignoreInitial: true
                    });

                    var emitNewScan = _.debounce(function() {
                        io.emit('scan:new');
                    }, 1000);

                    function onFileChange(path, stats) {
                        var fileInfo = fileScraper.scrape(path);
                        // if video or subtitle
                        if(fileInfo && (fileInfo.type === 'video' || fileInfo.type === 'subtitle')) {
                            if(stats && stats.ctime) {
                                fileInfo.ctime = new Date(stats.ctime).getTime();
                            }
                            filesList.update({file: fileInfo.file}, fileInfo, {upsert: true}, function(err) {
                                if(err) {
                                    console.log(err);
                                }
                            });
                            if(initialScanDone) {
                                emitNewScan();
                            }
                        }
                    }

                    // Add event listeners
                    watcher
                    //.on('all', function(event, path) {console.log(event, path);})
                        .on('add', onFileChange)
                        .on('change', onFileChange)
                        .on('unlink', function(path) {
                            //console.log('File', path, 'has been removed');
                            filesList.remove({path: path})
                        })
                        // More events.
                        /*.on('addDir', function(path, stats) {
                         //console.log('Directory', path, 'has been added');
                         var dir = {type: 'dir', path: path};
                         filesList.update(dir, dir, {upsert: true})
                         })
                         .on('unlinkDir', function(path) {
                         //console.log('Directory', path, 'has been removed');
                         filesList.remove({type: 'dir', path: path})
                         })*/
                        .on('error', function(error) {
                            console.log('Error happened', error);
                        })
                        .on('ready', function() {
                            initialScanDone = true;
                            console.log('Initial scan complete. Ready for changes.');
                            filesList.persistence.compactDatafile(); // compress the db
                            emitNewScan();
                        })
                }

				return console.log("Listening on port " + (appParams.port || process.env.PORT || 3000) + ". Go to http://localhost:" + (appParams.port || process.env.PORT || 3000) + "/ and enjoy !");
			});
		});
	}
};
