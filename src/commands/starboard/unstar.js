const { Command } = require('discord-akairo');

class UnstarCommand extends Command {
	constructor() {
		super('unstar', {
			aliases: ['unstar'],
			category: 'starboard',
			channelRestriction: 'guild',
			clientPermissions: ['MANAGE_MESSAGES'],
			args: [
				// Indices are swapped in order to process channel first.
				{
					id: 'channel',
					prompt: {
						start: 'What channel is the message you are trying to remove a star from in?',
						retry: 'Please give me a valid channel.'
					},
					optional: true,
					index: 1,
					type: 'textChannel',
					default: message => message.channel
				},
				{
					id: 'message',
					prompt: {
						start: 'What message would you like to remove a star from? (use its ID).',
						retry: (message, { channel }) => `Oops! I can't find that message in ${channel}. Remember to use its ID.`
					},
					index: 0,
					type: (word, message, { channel }) => {
						if (!word) return null;
						// eslint-disable-next-line prefer-promise-reject-errors
						return channel.fetchMessage(word).catch(() => Promise.reject());
					}
				}
			]
		});
	}

	async exec(message, { message: msg }) {
		const starboard = this.client.starboards.get(message.guild.id);
		const error = await starboard.remove(msg, message.author);
		if (error) {
			message.util.reply(error);
		}
	}
}

module.exports = UnstarCommand;
