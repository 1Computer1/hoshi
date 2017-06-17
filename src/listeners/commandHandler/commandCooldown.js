const { Listener } = require('discord-akairo');

class CommandCooldownListener extends Listener {
	constructor() {
		super('commandCooldown', {
			eventName: 'commandCooldown',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	exec(message, command, remaining) {
		const time = remaining / 1000;
		message.channel.send(`You can use that command again in ${time} seconds.`);
	}
}

module.exports = CommandCooldownListener;
