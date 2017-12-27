const { Command } = require('discord-akairo');

class StarThresholdCommand extends Command {
	constructor() {
		super('starThreshold', {
			aliases: ['star-threshold', 'threshold-star', 'star-limit', 'limit-star'],
			category: 'starboard',
			channel: 'guild',
			userPermissions: ['ADMINISTRATOR'],
			args: [
				{
					id: 'threshold',
					type: word => {
						if (!word) return null;
						const num = this.handler.resolver.type('integer')(word);
						if (num <= 0) return null;
						return num;
					},
					prompt: {
						start: 'What would you like the threshold for stars to show up on the starboard to be?',
						retry: 'Please provide an integer greater than zero.'
					}
				}
			]
		});
	}

	async exec(message, { threshold }) {
		await this.client.settings.set(message.guild, 'starThreshold', threshold);
		return message.util.reply(`The star threshold has been set to ${threshold}.`);
	}
}

module.exports = StarThresholdCommand;
