const { Command } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');
const emoji = require('node-emoji');

class EmojiCommand extends Command {
	constructor() {
		super('emoji', {
			aliases: ['emoji'],
			category: 'starboard',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'emojiID',
					match: 'content',
					type: (msg, phrase) => {
						if (!phrase) return null;
						const unicode = emoji.find(phrase);
						if (unicode) {
							return unicode.emoji;
						}

						const custom = this.client.emojis.find(e => e.toString() === phrase);
						if (custom) {
							return custom.id;
						}

						return null;
					},
					prompt: {
						start: 'What would you like to set the emoji to?',
						retry: 'Please provide a valid Unicode or custom emoji.'
					}
				}
			],
			description: {
				content: 'Changes the emoji for the starboard of the guild.',
				usage: '<emoji>',
				examples: ['🍕']
			}
		});
	}

	async exec(message, { emojiID }) {
		await this.client.settings.set(message.guild, 'emoji', emojiID);
		if (emojiID === '⭐') return message.util.reply('Emoji has been reset to ⭐');
		return message.util.reply(`Emoji has been set to ${Starboard.emojiFromID(this.client, emojiID)}`);
	}
}

module.exports = EmojiCommand;
