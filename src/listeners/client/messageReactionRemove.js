const { Listener } = require('discord-akairo');

class MessageReactionRemoveListener extends Listener {
	constructor() {
		super('messageReactionRemove', {
			eventName: 'messageReactionRemove',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec(reaction, user) {
		if (user.id === this.client.user.id) return;

		if (reaction.emoji.name === '⭐') {
			if (!reaction.message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
				reaction.message.reply('I\'m missing `Manage Messages` to unstar that message in this channel.');
				return;
			}

			const starboard = this.client.starboards.get(reaction.message.guild.id);
			const error = await starboard.remove(reaction.message, user);

			if (error) {
				reaction.message.reply(error);
			}
		}
	}
}

module.exports = MessageReactionRemoveListener;
