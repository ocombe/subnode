var fs = require('fs');

exports.index = function(req, res) {
	fs.readdir('M:/TV/', function(err, files) {
		res.render('index', {
			title: 'subNode',
			scripts: ['https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js', 'nowjs/now.js'],
			shows: files
		});
	});
};