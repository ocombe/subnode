var FastList = require("fast-list"),
	idleHands = require('idle-hands');

function bgQueue() {
	this._list = new FastList();
	this._listLow = new FastList();
	this._idleWait = false;
	this._flushWait = false;
}

bgQueue.prototype = {
	add: function(fn) {
		this._list.push(fn);
		this.flush();
	},

	addTop: function(fn) {
		this._list.unshift(fn);
		this.flush();
	},

	addLow: function(fn) {
		this._listLow.push(fn);
		this.flush();
	},

	flush: function() {
		if(!this._flushWait) {
			var self = this;
			if(self._list.length > 0) {
				if(self._idleWait) {
					self._idleWait = false;
					idleHands.stop(); // stop idle watcher
					idleHands.removeAllListeners('idle');
				}
				self._flushWait = true;
				self._list.shift()(function() {
					self.done();
				});
			} else if(self._listLow.length > 0 && !self._idleWait) {
				self._idleWait = true;
				idleHands.start(); // start idle watcher
				idleHands.on('idle', function() {
					self._flushWait = true;
					idleHands.stop(); // stop idle watcher
					idleHands.removeAllListeners('idle');
					self._listLow.shift()(function() {
						self.done();
					});
				});
			} else {
				return;
			}
		}
	},

	done: function() {
		// mark that unflushed
		this._flushWait = false;
		this._idleWait = false;
		this.flush();
	}
};

module.exports = new bgQueue();