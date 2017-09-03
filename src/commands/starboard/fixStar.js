const { Command } = require('discord-akairo');

class FixStarCommand extends Command {
	constructor() {
		super('fixStar', {
			aliases: ['fixStar', 'fix-star', 'fixStars', 'fix-stars'],
			category: 'starboard',
			channelRestriction: 'guild',
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				// Indices are swapped in order to process channel first.
				{
					id: 'channel',
					index: 1,
					match: 'rest',
					type: 'textChannel',
					default: message => message.channel,
					prompt: {
						start: msg => `${msg.author} **::** That channel could not be found. What channel is the message you are trying to fix the stars of in?`,
						retry: msg => `${msg.author} **::** Please provide a valid text channel.`,
						optional: true
					}
				},
				{
					id: 'message',
					index: 0,
					type: (word, message, { channel }) => {
						if (!word) return null;
						// eslint-disable-next-line prefer-promise-reject-errors
						return channel.fetchMessage(word).catch(() => Promise.reject());
					},
					prompt: {
						start: msg => `${msg.author} **::** Could not find a message. What is the ID of the message you would like to fix the stars of?`,
						retry: (msg, { channel }) => `${msg.author} **::** Oops! I can't find that message in ${channel}. Remember to use its ID.`
					}
				}
			]
		});
	}

	async exec(message, { message: msg }) {
		const starboard = this.client.starboards.get(message.guild.id);
		const error = await starboard.fix(msg);
		if (error) {
			return message.util.reply(error);
		} else {
			return message.util.reply('Successfully fixed the stars for the message!');
		}
	}
}

module.exports = FixStarCommand;
