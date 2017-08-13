const { Listener } = require('discord-akairo');

class MessageDeleteListener extends Listener {
	constructor() {
		super('messageDelete', {
			eventName: 'messageDelete',
			emitter: 'client',
			category: 'client'
		});
	}

	exec(message) {
		if (!message.guild) return;
		const starboard = this.client.starboards.get(message.guild.id);
		starboard.delete(message);
	}
}

module.exports = MessageDeleteListener;
