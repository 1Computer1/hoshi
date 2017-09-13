const { Command } = require('discord-akairo');

const Reps = require('../../models/reputations');

class ResetCommand extends Command {
	constructor() {
		super('reset', {
			aliases: ['reset'],
			category: 'general',
			channelRestriction: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'mode',
					match: 'content',
					type: [['stars', 'star'], ['reps', 'rep'], 'all'],
					prompt: {
						start: msg => `${msg.author} **::** Please choose a mode for reset: \`stars\`, \`reps\`, \`all\`.`,
						retry: msg => [
							`${msg.author} **::** You did not choose a valid reset mode.`,
							'Choose one of `stars`, `reps` or `all`.'
						]
					}
				},
				{
					id: 'confirm',
					match: 'none',
					type: word => {
						if (!word) return null;

						// Yes, yea, ye, or y.
						if (/^y(?:e(?:a|s)?)?$/i.test(word)) return 'yes';
						return 'no';
					},
					prompt: {
						start: (msg, { mode }) => `${msg.author} **::** ${{
							stars: 'Are you sure you want to reset all stars on this server? (y/N)',
							reps: 'Are you sure you want to reset all reputation points on this server? (y/N)',
							all: 'Are you sure you want to reset all stars and reputation points on this server? (y/N)'
						}[mode]}`,
						retry: () => ''
					}
				}
			]
		});
	}

	async exec(message, { mode, confirm }) {
		if (confirm === 'no') {
			return message.util.send('Reset has been cancelled.');
		}

		if (mode === 'stars' || mode === 'all') await this.client.starboards.get(message.guild.id).destroy();
		if (mode === 'reps' || mode === 'all') await Reps.destroy({ where: { guildID: message.guild.id } });

		return message.util.send(`${message.author} **::** ${{
			stars: 'Successfully removed all starred messages on this server.',
			reps: 'Successfully removed all reputation points on this server.',
			all: 'Successfully removed all starred messages and reputation points on this server.'
		}[mode]}`);
	}
}

module.exports = ResetCommand;
