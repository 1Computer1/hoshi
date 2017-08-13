const { Listener } = require('discord-akairo');

class MessageDeleteBulkListener extends Listener {
	constructor() {
		super('messageDeleteBulk', {
			eventName: 'messageDeleteBulk',
			emitter: 'client',
			category: 'client'
		});
	}

	exec(messages) {
		if (!messages.first().guild) return;
		const starboard = this.client.starboards.get(messages.first().guild.id);
		for (const message of messages) {
			starboard.delete(message);
		}
	}
}

module.exports = MessageDeleteBulkListener;
