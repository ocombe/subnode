var forever = require('forever-monitor');
var subNode;

subNode = new (forever.Monitor)('./server/serverWrapper.js', {
	command: 'node',
	max: 3,
	silent: false
});

subNode.on('exit', function() {
	console.log('subNode has exited.');
});

subNode.on('exit:code', function(code, signal) {
	if(code === 3330) {
		subNode.stop();
	} else if(code === 3331) {
		subNode.restart();
	}
});

subNode.on('restart', function() {
	console.log('subNode was restarted');
});

subNode.start();