const { Listener } = require('discord-akairo');
const Logger = require('../../util/Logger');

class CommandCooldownListener extends Listener {
	constructor() {
		super('commandCooldown', {
			event: 'commandCooldown',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	exec(message, command, remaining) {
		const time = remaining / 1000;
		const tag = message.guild ? message.guild.name : `${message.author.tag}/PM`;
		Logger.log(`=> ${command.id} ~ ${time}`, { tag });
		message.reply(`You can use that command again in ${time} seconds.`);
	}
}

module.exports = CommandCooldownListener;
