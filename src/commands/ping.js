const { Command } = require('discord-akairo');

module.exports = class PingCommand extends Command {
	constructor() {
		super('ping', { aliases: ['ping'] });
	}

	exec(message) {
		return message.reply('Pong!');
	}
};
