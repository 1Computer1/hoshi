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
		if (user.id === this.client.user.id) return;
		if (!reaction.message.guild) return;

		if (reaction.emoji.name === '⭐') {
			if (!reaction.message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
				reaction.message.channel.send(`${user} **::** I'm missing \`Manage Messages\` to star that message in this channel.`);
				return;
			}

			const starboard = this.client.starboards.get(reaction.message.guild.id);
			const error = await starboard.add(reaction.message, user);

			if (error) {
				await reaction.remove(user);
				if (reaction.message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
					reaction.message.channel.send(`${user} **::** ${error}`);
				}
			}
		}
	}
}

module.exports = MessageReactionAddListener;
