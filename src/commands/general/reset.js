const { Command } = require('discord-akairo');
const Reputation = require('../../models/reputations');

class ResetCommand extends Command {
	constructor() {
		super('reset', {
			aliases: ['reset'],
			category: 'general',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			quoted: false,
			args: [
				{
					id: 'mode',
					match: 'content',
					type: [['stars', 'star'], ['reps', 'rep'], 'all'],
					prompt: {
						start: 'Please choose an item to reset: `stars`, `reps`, `all`.',
						retry: [
							'Please provide a valid reset item.',
							'Choose one of `stars`, `reps` or `all`.'
						]
					}
				},
				{
					id: 'confirm',
					match: 'none',
					type: phrase => {
						if (!phrase) return null;

						// Yes, yea, ye, or y.
						if (/^y(?:e(?:a|s)?)?$/i.test(phrase)) return true;
						return false;
					},
					prompt: {
						start: (msg, { mode }) => `${{
							stars: 'Are you sure you want to reset all stars on this server? (y/N)',
							reps: 'Are you sure you want to reset all reputation points on this server? (y/N)',
							all: 'Are you sure you want to reset all stars and reputation points on this server? (y/N)'
						}[mode]}`,
						retry: ''
					}
				}
			],
			description: {
				content: 'Resets the stars and/or reputations of the guild.',
				usage: '<mode>',
				examples: ['stars', 'reps', 'all']
			}
		});
	}

	async exec(message, { mode, confirm }) {
		if (!confirm) {
			return message.util.send('Reset has been cancelled.');
		}

		if (mode === 'stars' || mode === 'all') await this.client.starboards.get(message.guild.id).destroy();
		if (mode === 'reps' || mode === 'all') await Reputation.destroy({ where: { guildID: message.guild.id } });

		return message.util.send(`${message.author} **::** ${{
			stars: 'Successfully removed all starred messages on this server.',
			reps: 'Successfully removed all reputation points on this server.',
			all: 'Successfully removed all starred messages and reputation points on this server.'
		}[mode]}`);
	}
}

module.exports = ResetCommand;
