const { Listener } = require('discord-akairo');
const Logger = require('../../util/Logger');

class CommandBlockedListener extends Listener {
	constructor() {
		super('commandBlocked', {
			eventName: 'commandBlocked',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	exec(message, command, reason) {
		const text = {
			owner: 'You must be the owner to use this command.',
			guild: 'You must be in a guild to use this command.'
		}[reason];

		if (!text) return;
		const name = message.guild ? message.guild.name : `${message.author.tag}/PM`;
		Logger.log(`[${name}]: => ${command.id} ~ ${reason}`);
		message.channel.send(text);
	}
}

module.exports = CommandBlockedListener;
