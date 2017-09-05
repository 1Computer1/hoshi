const { Command } = require('discord-akairo');

class StarCommand extends Command {
	constructor() {
		super('starboard', {
			aliases: ['starboard'],
			category: 'starboard',
			channel: 'guild',
			userPermissions: ['ADMINISTRATOR'],
			args: [
				{
					id: 'channel',
					match: 'content',
					type: 'textChannel',
					prompt: {
						start: msg => `${msg.author} **::** What channel would you like to use as the starboard?`,
						retry: msg => `${msg.author} **::** Please provide a valid text channel.`
					}
				},
				{
					id: 'confirm',
					match: 'none',
					type: (word, message, { channel }) => {
						const oldID = this.client.settings.get(message.guild, 'starboardChannelID');
						if (oldID && oldID !== channel.id) {
							if (!word) return null;

							// Yes, yea, ye, or y.
							if (/^y(?:e(?:a|s)?)?$/i.test(word)) return 'yes';
							return 'no';
						}

						return 'first';
					},
					prompt: {
						start: (msg, { channel }) => `${msg.author} **::** Are you sure you want to delete the previous starboard of ${channel}? (y/N)`,
						retry: ''
					}
				}
			]
		});
	}

	async exec(message, { channel, confirm }) {
		if (confirm === 'no') {
			return message.util.reply('Starboard change has been cancelled.');
		}

		const oldID = this.client.settings.get(message.guild, 'starboardChannelID');
		await this.client.settings.set(message.guild, 'starboardChannelID', channel.id);

		if (oldID && oldID !== channel.id) {
			await this.client.starboards.get(channel.guild.id).destroy();
		}

		return message.util.reply(`Starboard channel has been set to ${channel}`);
	}
}

module.exports = StarCommand;
