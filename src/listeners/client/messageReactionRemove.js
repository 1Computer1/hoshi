const { Listener } = require('discord-akairo');

class MessageReactionRemoveListener extends Listener {
	constructor() {
		super('messageReactionRemove', {
			eventName: 'messageReactionRemove',
			emitter: 'client',
			category: 'client'
		});
	}

	exec() {
		/**
		 * Implement all this later.
		 *
		 * if (reaction.emoji !== '⭐') return;
		 * doStarboardThingsHere();
		 */
	}
}

module.exports = MessageReactionRemoveListener;
