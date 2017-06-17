const chalk = require('chalk');
const moment = require('moment');
const util = require('util');

class Logger {
	static log(content) {
		this.write(content, {
			color: 'grey',
			tag: 'Log'
		});
	}

	static info(content) {
		this.write(content, {
			color: 'green',
			tag: 'Info'
		});
	}

	static warn(content) {
		this.write(content, {
			color: 'yellow',
			tag: 'Warn'
		});
	}

	static error(content) {
		this.write(content, {
			color: 'red',
			tag: 'Error',
			error: true
		});
	}

	static stackTrace(content) {
		this.write(content, {
			color: 'white',
			tag: 'Error',
			error: true
		});
	}

	static write(content, options = {}) {
		const { color = 'grey', tag = 'Log', error = false } = options;
		const timestamp = chalk.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]:`);
		const levelTag = chalk.bold(`[${tag}]:`);
		const text = chalk[color](this.clean(content));
		const stream = error ? process.stderr : process.stdout;
		stream.write(`${timestamp} ${levelTag} ${text}\n`);
	}

	static clean(item) {
		if (typeof item === 'string') return item;
		const cleaned = util.inspect(item, { depth: Infinity });
		return cleaned;
	}
}

module.exports = Logger;
