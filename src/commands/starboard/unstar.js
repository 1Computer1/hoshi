const { Command } = require('discord-akairo');
const Star = require('../../models/stars');

class UnstarCommand extends Command {
	constructor() {
		super('unstar', {
			aliases: ['unstar'],
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
						start: 'That channel could not be found. What channel is the message you are trying to remove a star from in?',
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
						start: 'What is the ID of the message you would like to remove a star from?',
						retry: (msg, { channel }) => `Please provide a valid message ID in ${channel}.`
					}
				}
			],
			description: {
				content: 'Unstars a message.',
				usage: '<message id> [channel]',
				examples: ['396429741176913921', '396430734585233411 #OtherChannel']
			}
		});
	}

	async exec(message, { message: msg }) {
		if (msg.author.id === message.author.id) {
			return message.util.reply('You can\'t unstar your own message.');
		}

		const starboard = this.client.starboards.get(msg.guild.id);

		if (!starboard.channel) {
			const prefix = this.client.commandHandler.prefix(message);
			return message.util.reply(`There isn't a starboard channel to use. Set one using the \`${prefix}starboard\` command!`);
		}

		if (!message.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) {
			return message.util.reply('I\'m missing `Manage Messages` to unstar that message in this channel.');
		}

		const missingPerms = starboard.missingPermissions();
		if (missingPerms) return message.util.reply(missingPerms);

		const star = await Star.findOne({ where: { messageID: msg.id } });

		if (!star || !star.starredBy.includes(message.author.id)) {
			return message.util.reply('You can\'t remove any star from this message because you never gave it one in the first place.');
		}

		const error = await starboard.remove(msg, message.author);
		if (error) return message.util.reply(error);
		return message.util.reply('The message has been unstarred.');
	}
}

module.exports = UnstarCommand;
