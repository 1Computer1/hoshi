const { Command } = require('discord-akairo');

class PingCommand extends Command {
	constructor() {
		super('ping', { aliases: ['ping'] });
	}

	async exec(message) {
		const sent = await message.channel.send('Pong!');
		return sent.edit(`Pong! (${sent.createdAt - message.createdAt} ms)`);
	}
}

module.exports = PingCommand;
