const { Command } = require('discord-akairo');

class StarCommand extends Command {
	constructor() {
		super('starboard', {
			aliases: ['starboard'],
			category: 'starboard',
			channel: 'guild',
			userPermissions: ['ADMINISTRATOR'],
			quoted: false,
			args: [
				{
					id: 'channel',
					match: 'content',
					type: 'textChannel',
					prompt: {
						start: 'What channel would you like to use as the starboard?',
						retry: 'Please provide a valid text channel.'
					}
				}
			],
			description: {
				content: 'Sets the channel for the starboard.',
				usage: '<channel>',
				examples: ['#starboard']
			}
		});
	}

	async exec(message, { channel }) {
		await this.client.settings.set(message.guild, 'starboardChannelID', channel.id);
		return message.util.reply(`Starboard channel has been set to ${channel}`);
	}
}

module.exports = StarCommand;
