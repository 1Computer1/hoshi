const { Command } = require('discord-akairo');

class DeleteStarCommand extends Command {
	constructor() {
		super('delete', {
			aliases: ['delete'],
			category: 'starboard',
			channelRestriction: 'guild',
			userPermissions: ['MANAGE_MESSAGES'],
			clientPermissions: ['MANAGE_MESSAGES'],
			args: [
				// Indices are swapped in order to process channel first.
				{
					id: 'channel',
					prompt: {
						start: 'What channel is the message you are trying to remove from the starboard in?',
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
						start: 'What message would you like to remove from the starboard? (use its ID).',
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
		await starboard.delete(msg);
		return message.util.reply('the message has been removed from the starboard');
	}
}

module.exports = DeleteStarCommand;
