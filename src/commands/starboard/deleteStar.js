const { Command } = require('discord-akairo');

class DeleteStarCommand extends Command {
	constructor() {
		super('deleteStar', {
			aliases: ['delete-star'],
			category: 'starboard',
			channel: 'guild',
			userPermissions: ['MANAGE_MESSAGES'],
			clientPermissions: ['MANAGE_MESSAGES'],
			args: [
				// Indices are swapped in order to process channel first.
				{
					id: 'channel',
					match: 'rest',
					index: 1,
					type: 'textChannel',
					default: message => message.channel,
					prompt: {
						start: 'That channel could not be found. What channel is the message you are trying to remove from the starboard in?',
						retry: 'Please provide a valid text channel.',
						optional: true
					}
				},
				{
					id: 'message',
					index: 0,
					type: (word, message, { channel }) => {
						if (!word) return null;
						return channel.messages.fetch(word).catch(() => {
							if (this.client.starboards.get(message.guild.id).stars.has(word)) {
								return { id: word };
							}

							return null;
						});
					},
					prompt: {
						start: 'What is the ID of the message you would like to remove from the starboard?',
						retry: (msg, { channel }) => `Please provide a valid message ID in ${channel}.`
					}
				}
			],
			description: {
				content: 'Deletes all the stars on a message and removes it from the starboard.',
				usage: '<message id> [channel]',
				examples: ['396429741176913921', '396430734585233411 #OtherChannel']
			}
		});
	}

	async exec(message, { message: msg }) {
		const starboard = this.client.starboards.get(message.guild.id);

		if (!starboard.initiated) {
			message.util.reply('Starboard has not fully loaded, please wait.');
			return;
		}

		if (!starboard.channel) {
			const prefix = this.client.commandHandler.prefix(message);
			message.util.reply(`There isn't a starboard channel to use. Set one using the \`${prefix}starboard\` command!`);
			return;
		}

		const missingPerms = starboard.missingPermissions();
		if (missingPerms) {
			message.util.reply(missingPerms);
			return;
		}

		if (!starboard.stars.has(msg.id)) {
			message.util.reply('The message cannot be removed because it does not exist in the starboard.');
			return;
		}

		const error = await starboard.delete(msg);
		if (error) {
			message.util.reply(error);
			return;
		}

		if (msg.reactions && msg.reactions.size) {
			await msg.reactions.removeAll().then(() => {
				starboard.reactionsRemoved.add(msg.id);
			});
		}

		message.util.reply('The message has been removed from the starboard.');
	}
}

module.exports = DeleteStarCommand;
