var https = require('https'),
	path = require('path'),
	fs = require('fs'),
	AdmZip = require('adm-zip'),
	request = require('request'),
	wrench = require('wrench'),
	_ = require('lodash'),

	GITHUB_HOST = 'api.github.com',
	GITHUB_API = 'https://' + GITHUB_HOST + '/repos/';

var updater = function() {
	return {
		packageJSON: null, // getPackageJSON
		currentTag: null,
		currentVersion: null, // getCurrentVersion
		lastTag: null,
		latestVersion: null, // parseTagVersion

		checkVersion: function(options, callback) {
			var self = this;
			if(typeof options === 'function') {
				callback = options;
				options = {};
			} else {
				if(!callback || typeof callback !== 'function') {
					console.error('ERROR: updater requires a callback');
					return;
				}
			}

			// getPackageJSON -> getCurrentVersion -> getLatestVersion -> parseTagVersion -> compareVersions
			var packageJSON = this.getPackageJSON(options.packagePath);
			var currentVersion = this.getCurrentVersion();
			this.getLatestVersion(options, function(err, latestVersion) {
				if(err) {
					callback(err);
				} else {
					var lastTag = self.getLastTag(latestVersion);
					self.latestVersion = self.parseTagVersion(lastTag);
					callback(self.compareVersions());
				}
			});
		},

		getPackageJSON: function(packagePath) {
			var packagePath = packagePath || path.resolve('package.json');

			var data = fs.readFileSync(packagePath, 'utf-8');

			try {
				this.packageJSON = JSON.parse(data);
			} catch(e) {
				throw 'ERROR: updater cannot parse package.json';
			}

			return this.packageJSON;
		},

		getCurrentVersion: function() {
			if(!this.packageJSON.version) {
				console.error('ERROR: updater cannot find `version` in package.json');
				this.callback('error');
				return;
			}

			this.currentVersion = this.packageJSON.version.replace(/[^0-9]+/g, '') / 1; // to num
			this.currentTag = this.packageJSON.version;
			return this.currentVersion;
		},

		getLatestVersion: function(options, callback) {
			if(typeof options == 'function') {
				callback = options;
				options = {};
			}
			var url = this.getURL(options.url),
				timeout = options.timeout || 3000,
				self = this;


			if(!url) {
				console.error('ERROR: github-update-checker requires URL passed as options or set in project package.json');
				this.callback('error');
				return;
			}

			var request = https.get(url,function(res) {
				var data = [];

				res.on('data', function(chunk) {
					data.push(chunk);
				});

				res.on('end', function() {
					self.latestVersion = data.join('');
					callback(null, data.join(''));
				})

			}).on('error', function(e) {
					throw 'WARN: updater says "' + e.message + '"';
				});

			request.setTimeout(timeout, function() {
				request.abort();
				callback('WARN: updater couldn\'t get "' + url + '"');
			});
		},

		getURL: function(url) {
			var url = url || this.getURLfromPackage();
			var parts = url.split('/');

			return {
				host: GITHUB_HOST,
				path: '/' + parts.slice(3, parts.length).join('/')
			};
		},

		getURLfromPackage: function() {
			if(!this.packageJSON) {
				this.packageJSON = this.getPackageJSON();
				if(!this.packageJSON || !this.packageJSON.repository || !this.packageJSON.repository.url) {
					return;
				}
			}

			var username = this.packageJSON.repository.url.split('/'), // ["https:", "", "github.com", "USERNAME", "REPO_NAME.git"]
				username = username.slice(3, username.length),    // ["USERNAME", "REPO_NAME.git"]
				repoName = username.pop(),                          // "REPO_NAME.git"
				repoName = repoName.split('.')[ 0 ];              // REPO_NAME

			return GITHUB_API + username + '/' + repoName + '/tags';
		},

		getLastTag: function(data) {
			var json = {},
				self = this;

			try {
				json = JSON.parse(data);
			} catch(e) {
				throw 'ERROR: updater cannot parse GitHub response';
			}

			json = this.sortTags(json);
			this.lastTag = json[0];
			return this.lastTag;
		},

		sortTags: function(tags) {
			tags.sort(function(a, b) {
				var versionsA = a.name.split('.');
				var versionsB = b.name.split('.');
				for(var i = 0, len = versionsA.length; i < len; i++) {
					if(versionsA[i] > versionsB[i]) {
						return false;
					} else if(versionsA[i] < versionsB[i]) {
						return true;
					}
				}
				return 0;
			});
			return tags;
		},

		parseTagVersion: function(lastTag) {
			return lastTag.name ? lastTag.name.replace(/[^0-9]+/g, '') / 1 : 0; // to num;
		},

		compareVersions: function() {
			var tags = this.sortTags([
				this.lastTag,
				{ name: this.currentTag }
			]);

			return tags[0].name === this.currentTag ? {upToDate: true} : {upToDate: false, current: this.currentTag, last: this.lastTag};
		},

		update: function(callback) {
			console.log('Update in progress');
			var self = this;
			if(!this.lastTag) {
				this.getLatestVersion(function(err, latestVersion) {
					if(err) {
						callback(err);
					} else {
						self.download(self.getLastTag(latestVersion).zipball_url);
					}
				});
			} else {
				this.download(this.lastTag.zipball_url, callback);
			}
		},

		download: function(url, callback) {
			console.log('Downloading new version...');
			request({
				uri: url,
				encoding: null
			}, function(e,r, bodyBuffer) {
				console.log('New version downloaded. Updating...');
				var zip = new AdmZip(bodyBuffer);
				var zipEntries = zip.getEntries();
				var updateFolder = zipEntries[0].entryName;
				zip.extractEntryTo(updateFolder, __dirname + '/../', false, true);

				// update node_modules if needed
				var exec = require('child_process').exec;
				var child = exec('npm install --production --unsafe-perm', function(err, stdout, stderr) {
					if (err) {
						console.log(err);
						callback({success: false, err: err});
					} else {
						callback({success: true});
					}
				});
			});
		}
	}
}

module.exports = updater();