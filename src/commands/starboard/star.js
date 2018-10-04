const { Command } = require('discord-akairo');

class StarCommand extends Command {
	constructor() {
		super('star', {
			aliases: ['star'],
			category: 'starboard',
			channel: 'guild',
			clientPermissions: ['MANAGE_MESSAGES'],
			quoted: false,
			args: [
				// Indices are swapped in order to process channel first.
				{
					'id': 'channel',
					'index': 1,
					'match': 'rest',
					'type': 'textChannel',
					'default': message => message.channel,
					'prompt': {
						start: 'That channel could not be found. What channel is the message you are trying to add a star to in?',
						retry: 'Please provide a valid text channel.',
						optional: true
					}
				},
				{
					id: 'message',
					index: 0,
					type: (phrase, message, { channel }) => {
						if (!phrase) return null;
						return channel.messages.fetch(phrase).catch(() => null);
					},
					prompt: {
						start: 'What is the ID of the message you would like to add a star to?',
						retry: (msg, { channel }) => `Please provide a valid message ID in ${channel}.`
					}
				}
			],
			description: {
				content: 'Stars a message.',
				usage: '<message id> [channel]',
				examples: ['396429741176913921', '396430734585233411 #OtherChannel']
			}
		});
	}

	async exec(message, { message: msg }) {
		const starboard = this.client.starboards.get(message.guild.id);
		const error = await starboard.add(msg, message.author);
		if (error !== undefined) {
			if (error.length) return message.util.reply(error);
			return;
		}
		return message.util.reply('The message has been starred.');
	}
}

module.exports = StarCommand;
