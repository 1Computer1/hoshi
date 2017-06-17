const { Listener } = require('discord-akairo');

class MessageReactionAddListener extends Listener {
	constructor() {
		super('messageReactionAdd', {
			eventName: 'messageReactionAdd',
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

module.exports = MessageReactionAddListener;
