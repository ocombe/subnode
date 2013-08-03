var forever = require('forever-monitor');

var subNode = new (forever.Monitor)('./server/serverWrapper.js', {
	command: 'node',
	max: 3,
	silent: false,
	env: {
		'PORT': '3000'
	}
});

subNode.on('exit', function() {
	console.log('subNode has exited after 3 unsuccessful restarts');
});

subNode.on('restart', function() {
	console.log('subNode was restarted');
});

subNode.start();