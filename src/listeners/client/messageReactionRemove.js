const { Listener } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

class MessageReactionRemoveListener extends Listener {
	constructor() {
		super('messageReactionRemove', {
			event: 'messageReactionRemove',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec(reaction, user) {
		if (user.id === this.client.user.id) return;
		if (reaction.message.partial) await reaction.message.fetch();
		if (!reaction.message.guild) return;

		const emojiStr = Starboard.emojiFromID(this.client, this.client.settings.get(reaction.message.guild, 'emoji', '⭐'));
		if (Starboard.emojiEquals(reaction.emoji, emojiStr)) {
			const starboard = this.client.starboards.get(reaction.message.guild.id);
			if (starboard.reactionsRemoved.has(reaction.message.id)) {
				starboard.reactionsRemoved.delete(reaction.message.id);
				return;
			}

			const error = await starboard.remove(reaction.message, user);

			if (error) {
				if (reaction.message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
					reaction.message.channel.send(`${user} **::** ${error}`);
				}
			}
		}
	}
}

module.exports = MessageReactionRemoveListener;
