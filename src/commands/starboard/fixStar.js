const { Command } = require('discord-akairo');

class FixStarCommand extends Command {
	constructor() {
		super('fixStar', {
			aliases: ['fix-star', 'fix-stars'],
			category: 'starboard',
			channel: 'guild',
			userPermissions: ['MANAGE_MESSAGES'],
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
						start: 'That channel could not be found. What channel is the message you are trying to fix the stars of in?',
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
						start: 'What is the ID of the message you would like to fix the stars of?',
						retry: (msg, { channel }) => `Please provide a valid message ID in ${channel}.`
					}
				}
			],
			description: {
				content: 'Fixes the stars on the message based on the reactions.',
				usage: '<message id> [channel]',
				examples: ['396429741176913921', '396430734585233411 #OtherChannel']
			}
		});
	}

	async exec(message, { message: msg }) {
		const starboard = this.client.starboards.get(message.guild.id);
		const error = await starboard.fix(msg);
		if (error) return message.util.reply(error);
		return message.util.reply('Successfully fixed the stars for the message!');
	}
}

module.exports = FixStarCommand;
