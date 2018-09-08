const { Command } = require('discord-akairo');
const Star = require('../../models/stars');

class DeleteStarCommand extends Command {
	constructor() {
		super('deleteStar', {
			aliases: ['delete-star'],
			category: 'starboard',
			channel: 'guild',
			userPermissions: ['MANAGE_MESSAGES'],
			clientPermissions: ['MANAGE_MESSAGES'],
			quoted: false,
			args: [
				// Indices are swapped in order to process channel first.
				{
					'id': 'channel',
					'match': 'rest',
					'index': 1,
					'type': 'textChannel',
					'default': message => message.channel,
					'prompt': {
						start: 'That channel could not be found. What channel is the message you are trying to remove from the starboard in?',
						retry: 'Please provide a valid text channel.',
						optional: true
					}
				},
				{
					id: 'message',
					index: 0,
					type: (phrase, message, { channel }) => {
						if (!phrase) return null;
						return channel.messages.fetch(phrase).catch(async () => {
							const star = await Star.findOne({ where: { messageID: phrase } });
							if (star) {
								return { id: phrase };
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

		if (!starboard.channel) {
			const prefix = this.client.commandHandler.prefix(message);
			return message.util.reply(`There isn't a starboard channel to use. Set one using the \`${prefix}starboard\` command!`);
		}

		const missingPerms = starboard.missingPermissions();
		if (missingPerms) return message.util.reply(missingPerms);

		if (!await Star.findOne({ where: { messageID: msg.id } })) {
			return message.util.reply('The message cannot be removed because it does not exist in the starboard.');
		}

		const error = await starboard.delete(msg);
		if (error) return message.util.reply(error);

		if (msg.reactions && msg.reactions.size) {
			await msg.reactions.removeAll().then(() => {
				starboard.reactionsRemoved.add(msg.id);
			});
		}

		return message.util.reply('The message has been removed from the starboard.');
	}
}

module.exports = DeleteStarCommand;
