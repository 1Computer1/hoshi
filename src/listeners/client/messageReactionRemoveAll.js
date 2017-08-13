const { Listener } = require('discord-akairo');

class MessageReactionRemoveAllListener extends Listener {
	constructor() {
		super('messageReactionRemoveAll', {
			eventName: 'messageReactionRemoveAll',
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

module.exports = MessageReactionRemoveAllListener;
