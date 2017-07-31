const { Command } = require('discord-akairo');

class StarCommand extends Command {
	constructor() {
		super('starboard', {
			aliases: ['starboard'],
			category: 'starboard',
			channelRestriction: 'guild',
			userPermissions: ['ADMINISTRATOR'],
			args: [
				{
					id: 'channel',
					prompt: {
						start: 'What channel would you like to use as the starboard?',
						retry: 'Please give me a valid channel.'
					},
					type: 'textChannel',
					default: message => message.guild.channels.find(c =>
						c.type === 'text' && c.name.toLowerCase() === 'starboard'
					)
				}
			]
		});
	}

	async exec(message, { channel }) {
		if (!channel) return message.util.reply('You must provide a starboard channel.');

		const oldID = this.client.settings.get(message.guild, 'starboardChannelID');
		await this.client.settings.set(message.guild, 'starboardChannelID', channel.id);

		if (oldID && oldID !== channel.id) {
			await this.client.starboards.get(channel.guild.id).destroy();
		}

		return message.util.reply(`Starboard channel has been set to ${channel}`);
	}
}

module.exports = StarCommand;
