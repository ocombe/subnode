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

            var request = https.get({
                hostname: url.host,
                path: url.path,
                headers: {
                    'User-Agent': 'subNode'
                }
            }, function(res) {
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
                repoName = repoName.split('.')[0];              // REPO_NAME

            return GITHUB_API + username + '/' + repoName + '/tags';
        },

        getLastTag: function(data) {
            var json = {};

            try {
                json = JSON.parse(data);
            } catch(e) {
                throw 'ERROR: updater cannot parse GitHub response';
            }

            this.lastTag = this.findLastTags(json);
            return this.lastTag;
        },

        findLastTags: function(tags) {
            var last = tags[0],
                lastNumber = last.name.split('.');
            _.each(tags, function(tag) {
                var numbers = tag.name.split('.');
                for(var i = 0, len = numbers.length; i < len; i++) {
                    if(Number(numbers[i]) < Number(lastNumber[i])) {
                        break;
                    } else if(Number(numbers[i]) > Number(lastNumber[i])) {
                        last = tag;
                        lastNumber = numbers;
                        break;
                    }
                }
            });
            return last;
        },

        parseTagVersion: function(lastTag) {
            return lastTag.name ? lastTag.name.replace(/[^0-9]+/g, '') / 1 : 0; // to num;
        },

        compareVersions: function() {
            var lastTag = this.findLastTags([
                this.lastTag,
                {name: this.currentTag}
            ]);

            return lastTag.name === this.currentTag ? {upToDate: true} : {
                upToDate: false,
                current: this.currentTag,
                last: this.lastTag
            };
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
            console.log(url);
            request({
                uri: url,
                encoding: null,
                headers: {
                    'User-Agent': 'subNode'
                }
            }, function(e, r, bodyBuffer) {
                console.log('New version downloaded. Updating...');
                var zip = new AdmZip(bodyBuffer);
                var zipEntries = zip.getEntries();
                var updateFolder = zipEntries[0].entryName;
                zip.extractEntryTo(updateFolder, __dirname + '/../', false, true);

                var npm = require("npm");
                npm.load(function(err) {
                    npm.config.set('only', 'production');
                    npm.config.set('production', true);
                    npm.config.set('unsafe-perm', true);
                    npm.config.set('ignore-scripts', true);

                    // catch errors
                    npm.commands.install([], function(err, data) {
                        if(err) {
                            console.log(err);
                            callback({success: false, err: err});
                        } else {
                            callback({success: true});
                        }
                    });
                    npm.on("log", function(message) {
                        // log the progress of the installation
                        console.log(message);
                    });
                });
            });
        }
    }
}

module.exports = updater();
