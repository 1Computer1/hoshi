const { Command } = require('discord-akairo');

const Reps = require('../../models/reputations');

class ResetCommand extends Command {
	constructor() {
		super('reset', {
			aliases: ['reset'],
			category: 'general',
			args: [
				{
					id: 'mode',
					match: 'content',
					type: ['stars', 'rep', 'all'],
					prompt: {
						start: msg => `${msg.author} **::** Please choose a mode for the reset (stars/rep/all)`,
						retry: msg => [
							`${msg.author} **::** You did not choose a valid reset mode.`,
							'Choose one of `stars`, `rep` or `all`'
						].join(' ')
					}
				}
			]
		});

		this.confirmationMessages = {
			stars: 'Are you sure you want to reset all stars on this server? (__y__es/__n__o)',
			rep: 'Are you sure you want to reset aa repuation points on this server? (__y__es/__n__o)',
			all: 'Are you sure you want to reset all stars and reputation points on this server? (__y__es/__n__o)'
		};

		this.successMessages = {
			stars: 'Successfully removed all starred messages on this server.',
			rep: 'Successfully removed all reputation points on this server.',
			all: 'Successfully removed all starred messages and reputation points on this server.'
		};
	}

	async exec(message, { mode }) {
		message.channel.send(`${message.author} **::** ${this.confirmationMessages[mode]}`);

		const confirmation = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
			maxMatches: 1,
			time: 10000,
			errors: ['time']
		}).then(messages => messages.first().content);
		if (['yes', 'y'].includes(confirmation.toLowerCase())) {
			if (mode === 'stars' || mode === 'all') await this.client.starboards.get(message.guild.id).destroy();
			if (mode === 'rep' || mode === 'all') await Reps.destroy({ where: { guildID: message.guild.id } });

			return message.util.send(`${message.author} **::** ${this.successMessages[mode]}`);
		} else {
			return message.util.send('Aborting...');
		}
	}
}

module.exports = ResetCommand;
