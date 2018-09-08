const { Command } = require('discord-akairo');

class StarThresholdCommand extends Command {
	constructor() {
		super('starThreshold', {
			aliases: ['star-threshold', 'threshold-star', 'star-limit', 'limit-star'],
			category: 'starboard',
			channel: 'guild',
			userPermissions: ['ADMINISTRATOR'],
			quoted: false,
			args: [
				{
					id: 'threshold',
					type: phrase => {
						if (!phrase) return null;
						const num = this.handler.resolver.type('integer')(phrase);
						if (num <= 0) return null;
						return num;
					},
					prompt: {
						start: 'What would you like the threshold for stars to show up on the starboard to be?',
						retry: 'Please provide an integer greater than zero.'
					}
				}
			],
			description: {
				content: 'Sets the amount of stars a message must receive before it appears on the starboard.',
				usage: '<threshold>',
				examples: ['5', '1']
			}
		});
	}

	async exec(message, { threshold }) {
		await this.client.settings.set(message.guild, 'starThreshold', threshold);
		return message.util.reply(`The star threshold has been set to ${threshold}.`);
	}
}

module.exports = StarThresholdCommand;
