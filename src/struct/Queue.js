const Logger = require('../util/Logger');

class Queue {
	constructor() {
		this._queue = [];
		this._processing = false;
	}

	get length() {
		return this._queue.length;
	}

	add(promiseFunc) {
		this._queue.push(promiseFunc);
		if (!this._processing) this._process();
	}

	_process() {
		this._processing = true;
		const promiseFunc = this._queue.shift();

		if (!promiseFunc) {
			this._processing = false;
		} else {
			promiseFunc().then(() => this._process()).catch(err => {
				Logger.error('An error occured in the queue');
				Logger.stacktrace(err);
				return this._process();
			});
		}
	}
}

module.exports = Queue;
