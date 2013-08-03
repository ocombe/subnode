var fs = require('fs'),
	path = require('path'),
	bgQueue = require('./background-queue'),
	_ = require('lodash');

// general function
module.exports = function(dir, action, complete) {
	function dive(dir) {
		// Read the directory
		bgQueue.addLow(function(done) {
			fs.readdir(dir, function(err, list) {
				todo--;

				// For every file in the list
				_.each(list, function(file) {
					if(file[0] != '.') {
						todo++;

						// Full path of that file
						var fullPath = path.resolve(dir, file);
						// Get the file's stats
						fs.stat(fullPath, function(err, stat) {
							// If the file is a directory
							if(stat) {
								if(stat.isDirectory()) {
									// Dive into the directory
									dive(fullPath);
								} else {
									// Call action if enabled for files
									action(fullPath);

									if(!--todo) {
										complete();
										done();
									}
								}
							}
						});
					}
				});
				//empty directories, or with just hidden files
				if(!todo) {
					complete();
				}
				done();
			});
		});
	};

	var todo = 1;
	dive(dir);
};