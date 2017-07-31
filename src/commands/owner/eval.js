const { Command } = require('discord-akairo');
const Logger = require('../../util/Logger');
const util = require('util');

class EvalCommand extends Command {
	constructor() {
		super('eval', {
			aliases: ['eval', 'e'],
			category: 'owner',
			ownerOnly: true,
			protected: true,
			args: [
				{
					id: 'code',
					match: 'content'
				}
			]
		});
	}

	async exec(message, { code }) {
		if (!code) return message.util.reply('No code provided!');

		const evaled = {};
		const logs = [];

		const token = this.client.token.split('').join('[^]{0,2}');
		const rev = this.client.token.split('').reverse().join('[^]{0,2}');
		const tokenRegex = new RegExp(`${token}|${rev}`, 'g');
		const cb = '```';

		const print = (...a) => { // eslint-disable-line no-unused-vars
			const cleaned = a.map(obj => {
				if (typeof o !== 'string') obj = util.inspect(obj, { depth: 1 });
				return obj.replace(tokenRegex, '[TOKEN]');
			});

			if (!evaled.output) {
				logs.push(...cleaned);
				return;
			}

			evaled.output += evaled.output.endsWith('\n') ? cleaned.join(' ') : `\n${cleaned.join(' ')}`;
			const title = evaled.errored ? '☠\u2000**Error**' : '📤\u2000**Output**';

			if (evaled.output.length + code.length > 1900) evaled.output = 'Output too long.';
			evaled.message.edit([
				`📥\u2000**Input**${cb}js`,
				code,
				cb,
				`${title}${cb}js`,
				evaled.output,
				cb
			]);
		};

		try {
			let output = eval(code);
			if (output instanceof Promise) output = await output;

			if (typeof output !== 'string') output = util.inspect(output, { depth: 0 });
			output = `${logs.join('\n')}\n${logs.length && output === 'undefined' ? '' : output}`;
			output = output.replace(tokenRegex, '[TOKEN]');

			if (output.length + code.length > 1900) output = 'Output too long.';

			const sent = await message.util.send([
				`📥\u2000**Input**${cb}js`,
				code,
				cb,
				`📤\u2000**Output**${cb}js`,
				output,
				cb
			]);

			evaled.message = sent;
			evaled.errored = false;
			evaled.output = output;

			return sent;
		} catch (err) {
			Logger.error('An eval error occured.');
			Logger.stacktrace(err);
			let error = err;

			error = error.toString();
			error = `${logs.join('\n')}\n${logs.length && error === 'undefined' ? '' : error}`;
			error = error.replace(tokenRegex, '[TOKEN]');

			const sent = await message.util.send([
				`📥\u2000**Input**${cb}js`,
				code,
				cb,
				`☠\u2000**Error**${cb}js`,
				error,
				cb
			]);

			evaled.message = sent;
			evaled.errored = true;
			evaled.output = error;

			return sent;
		}
	}
}

module.exports = EvalCommand;
