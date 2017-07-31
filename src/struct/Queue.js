class Queue {
	constructor() {
		this._queue = [];
		this._processing = false;
	}

	add(promiseFunc) {
		this._queue.push(promiseFunc);
		if (!this._processing) this._process();
	}

	_process() {
		this._processing = true;
		const promiseFunc = this._queue.pop();

		if (!promiseFunc) {
			this._processing = false;
		} else {
			promiseFunc().then(this._process.bind(this));
		}
	}
}

module.exports = Queue;
