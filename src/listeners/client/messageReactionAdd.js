const { Listener } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

class MessageReactionAddListener extends Listener {
	constructor() {
		super('messageReactionAdd', {
			event: 'messageReactionAdd',
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
			const error = await starboard.add(reaction.message, user);

			if (error !== undefined) {
				if (reaction.message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
					await reaction.users.remove(user).then(() => {
						starboard.reactionsRemoved.add(reaction.message.id);
					}).catch(() => null);
				}

				if (error.length && reaction.message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
					reaction.message.channel.send(`${user} **::** ${error}`);
				}
			}
		}
	}
}

module.exports = MessageReactionAddListener;
