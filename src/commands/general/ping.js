const { Command } = require('discord-akairo');

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'general'
		});
	}

	async exec(message) {
		const sent = await message.util.send('Pong!');
		const sentTime = sent.editedTimestamp || sent.createdTimestamp;
		const startTime = message.editedTimestamp || message.createdTimestamp;
		return message.util.send(`Pong! (${sentTime - startTime} ms)`);
	}
}

module.exports = PingCommand;
