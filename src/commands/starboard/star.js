const { Command } = require('discord-akairo');

class StarCommand extends Command {
	constructor() {
		super('star', {
			aliases: ['star'],
			category: 'starboard',
			channel: 'guild',
			clientPermissions: ['MANAGE_MESSAGES'],
			args: [
				// Indices are swapped in order to process channel first.
				{
					id: 'channel',
					index: 1,
					match: 'rest',
					type: 'textChannel',
					default: message => message.channel,
					prompt: {
						start: 'That channel could not be found. What channel is the message you are trying to add a star to in?',
						retry: 'Please provide a valid text channel.',
						optional: true
					}
				},
				{
					id: 'message',
					index: 0,
					type: (word, message, { channel }) => {
						if (!word) return null;
						return channel.messages.fetch(word).catch(() => null);
					},
					prompt: {
						start: 'What is the ID of the message you would like to add a star to?',
						retry: (msg, { channel }) => `Please provide a valid message ID in ${channel}.`
					}
				}
			]
		});
	}

	async exec(message, { message: msg }) {
		const starboard = this.client.starboards.get(message.guild.id);
		const error = await starboard.add(msg, message.author);
		if (error) {
			message.util.reply(error);
		}
	}
}

module.exports = StarCommand;
