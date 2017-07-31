const { Listener } = require('discord-akairo');

class MessageReactionAddListener extends Listener {
	constructor() {
		super('messageReactionAdd', {
			eventName: 'messageReactionAdd',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec(reaction, user) {
		if (reaction.emoji.name === '⭐') {
			const starboard = this.client.starboards.get(reaction.message.guild.id);
			const error = await starboard.add(reaction.message, user);
			if (error) {
				if (reaction.message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
					await reaction.remove(user);
				}
				reaction.message.channel.send(`${user}, ${error}`);
			}
		}
	}
}

module.exports = MessageReactionAddListener;
