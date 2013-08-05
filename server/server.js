module.exports = {
	startServer: function() {
		var express = require('express'),
			app = express(),
			nconf = require('nconf'),
			nconf = new nconf.Provider().file('config', __dirname + '/../appParams.json'),
			fs = require('fs'),
			request = require('request'),
			path = require('path'),
			fileScraper = require('./scraper'),
			addic7ed = require('./addic7ed.js'),
			betaSeries = require('./betaSeries.js'),
			wrench = require('wrench'),
			_ = require('lodash'),
			TVDB = require('tvdb'),
			tvdb = new TVDB({apiKey: "66BBEB48D4C7D155"}),
			updater = require('./updater'),
			lastUpdateCheck = 0,
			upToDate;

		var appParams = {},
			tvdbMirrors,
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
				res.send(401);
			}
		}

		app.configure(function() {
			app.use(express.errorHandler({
				dumpExceptions: true,
				showStack: true
			}));
			app.use(express.logger({
				format: ':method :url'
			}));
			app.use(express.bodyParser());
			app.use(express.compress()); // Gzip content
			app.use(express.static(__dirname + "/../public"));
			app.use(authenticate);
			return app.use(express.methodOverride());
		});

		app.get('/', function(req, response) {
			return response.sendfile('../public/index.html');
		});

		app.get('/params', function(req, response) {
			return response.json(appParams);
		});

		app.post('/params', function(req, response) {
			appParams = req.body;
			nconf.set("rootFolder", appParams.rootFolder);
			nconf.set("autorename", appParams.autorename);
			nconf.set("subLang", appParams.subLang);
			nconf.set("username", appParams.username);
			nconf.set("password", appParams.password);
			nconf.set("providers", appParams.providers);
			nconf.save(function(err) {
				response.send(err);
				app.use(authenticate);
			});
		});

		app.get('/checkUpdate', function(req, response) {
			var now = new Date().getTime();
			if(now - lastUpdateCheck <= 6*60*60*1000) { // 1 check / 6h
				return response.json(upToDate);
			} else {
				updater.checkVersion(function(res) {
					lastUpdateCheck = new Date().getTime();
					upToDate = res;
					return response.json(res);
				});
			}
		});

		app.get('/update', function(req, response) {
			updater.update(function(res) {
				response.json(res);
				console.log('Update complete, restarting server');
				process.exit(0);
			});
		});

		app.get('/showList', function(req, response) {
			if(appParams && appParams.rootFolder) {
				fs.readdir(appParams.rootFolder, function(err, folders) {
					return response.json(folders ? folders.sort() : []);
				});
			} else {
				return response.json([]);
			}
		});

		app.get('/show/:showId', function(req, response) {
			if(appParams.rootFolder != '') {
				var filesList = [],
					episodes = {},
					subtitles = {},
					episodesList = [];
				wrench.readdirRecursive(appParams.rootFolder + '/' + req.params.showId, function(error, curFiles) {
					if(typeof curFiles === 'undefined') {
						return response.json([]);
					} else if(curFiles !== null) {
						_.each(curFiles, function(file) {
							var fileInfo = fileScraper.scrape(appParams.rootFolder + '/' + req.params.showId + '/' + file);
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
						});
					} else { // we have all files
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
							episodesList.push({
								season: i,
								episodes: episodes[i]
							});
						}
						return response.json(episodesList);
					}
				});
			}
		});

		app.get('/betaSeries/:showId/:episode', function(req, response) {
			betaSeries.getSubtitles({
				fileInfo: fileScraper.scrape(req.params.episode),
				lang: appParams.subLang,
				showId: req.params.showId
			}, function(subtitles) {
				return response.json(subtitles);
			});
		});

		app.get('/addic7ed/:showId/:episode', function(req, response) {
			addic7ed.getSubtitles({
				fileInfo: fileScraper.scrape(req.params.episode),
				lang: appParams.subLang,
				showId: req.params.showId
			}, function(subtitles) {
				return response.json(subtitles);
			});
		});

		app.post('/download', function(req, response) {
			var folder = path.dirname(req.body.episode) + '/',
				newName = path.basename(req.body.episode).replace(path.extname(req.body.episode), path.extname(req.body.subtitle)); // send false for no autorename
			if(req.body.url.indexOf('betaseries') != -1) {
				betaSeries.download({
					url: req.body.url,
					folder: folder,
					subtitle: req.body.subtitle,
					newName: newName
				}, function(err, res) {
					return response.json({success: res});
				});
			} else if(req.body.url.indexOf('addic7ed') != -1) {
				addic7ed.download({
					url: req.body.url,
					folder: folder,
					newName: newName
				}, function(err, res) {
					return response.json({success: res});
				});
			}
		});

		app.get('/lastEpisodes/:refresh', function(req, response) {
			var filesList = [],
				now = new Date();
			if(req.params.refresh === 'false' && lastEpisodes.length > 0 && now - lastFetch <= 15 * 60 * 60 * 1000) {
				return response.json(lastEpisodes);
			} else {
				if(appParams.rootFolder) {
					wrench.readdirRecursive(appParams.rootFolder, function(error, curFiles) {
						if(curFiles == null) {
							filesList = filesList.sort(function(a, b) {
								return b.ctime - a.ctime;
							});

							lastEpisodes = filesList.splice(0, 10);
							_.each(lastEpisodes, function(file) {
								file.episode = fileScraper.scrape(appParams.rootFolder + '/' + file.episode);
							});
							lastFetch = now;
							return response.json(lastEpisodes);
						} else {
							_.each(curFiles, function(file) {
								if(/\.(3g2|3gp|3gp2|asf|avi|divx|flv|m4v|mk2|mka|mkv|mov|mp4|mp4a|mpeg|mpg|ogg|ogm|ogv|qt|ra|ram|rm|ts|wav|webm|wma|wmv)$/i.test(file)) {
									fs.stat(appParams.rootFolder + '/' + file, function(err, s) {
										if(s.ctime && s.ctime <= now) {
											filesList.push({episode: file, ctime: s.ctime.getTime()});
										}
									});
								}
							});
						}
					});
				} else {
					return response.json([]);
				}
			}
		});

		app.get('/banner/:showId', function(req, response) {
			var filename = __dirname + '/../banners/' + req.params.showId + '.jpg';
			fs.exists(filename, function(exists) {
				if(exists) {
					fs.createReadStream(filename).pipe(response);
				} else {
					var getBanner = function() {
						tvdb.findTvShow(req.params.showId, function(err, tvShows) {
							if(err) return;
							if(tvShows && tvShows.length > 0 && tvShows[0].banner) {
								var bannerUrl = tvdbMirrors[0].url + '/banners/' + tvShows[0].banner;
								wrench.mkdirSyncRecursive(__dirname + '/../banners/', 0777);
								var stream = request(bannerUrl).on('end', function() {
									fs.createReadStream(filename).pipe(response);
								});
								stream.pipe(fs.createWriteStream(filename));
							} else {
								return response.end();
							}
						});
					}
					if(!tvdbMirrors) {
						tvdb.getMirrors(function(err, mirrors) {
							if(err) return;
							tvdbMirrors = mirrors;
							getBanner();
						});
					} else {
						getBanner();
					}
				}
			});
		});

		return app.listen(process.env.PORT || 3000, function() {
			nconf.load(function() {
				appParams = {
					rootFolder: nconf.get('rootFolder'),
					sickbeardUrl: nconf.get('sickbeardUrl'),
					sickbeardApiKey: nconf.get('sickbeardApiKey'),
					autorename: nconf.get('autorename'),
					subLang: nconf.get('subLang'),
					username: nconf.get('username'),
					password: nconf.get('password'),
					providers: nconf.get('providers')
				};
			});

			return console.log("Listening on port "+(process.env.PORT || 3000)+". Go to http://localhost:"+(process.env.PORT || 3000)+"/ and enjoy !");
		});
	}
};