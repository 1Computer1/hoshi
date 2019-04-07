const { Command } = require('discord-akairo');
const Reputation = require('../../models/reputations');

class DeleteRepCommand extends Command {
	constructor() {
		super('deleteRep', {
			aliases: ['delete-rep'],
			category: 'reputation',
			channel: 'guild',
			userPermissions: ['MANAGE_MESSAGES'],
			clientPermissions: ['MANAGE_MESSAGES'],
			description: {
				content: 'Deletes a reputation from someone to someone else.',
				usage: '<source user> <target user>',
				examples: ['@badrepper @innocentperson']
			}
		});
	}

	*args() {
		const source = yield {
			type: 'member',
			prompt: {
				start: 'Which user gave the reputation you would like to delete?',
				retry: 'Please provide a valid user.'
			}
		};

		const target = yield {
			type: 'member',
			prompt: {
				start: `Which user's rep by **${source.user.tag}** would you like to delete?`,
				retry: 'Please provide a valid user.'
			}
		};

		return { source, target };
	}

	async exec(message, { source, target }) {
		const rep = await Reputation.findOne({
			where: {
				sourceID: source.id,
				targetID: target.id,
				guildID: message.guild.id
			}
		});

		if (!rep) {
			return message.util.reply(`The rep from **${source.user.tag}** to **${target.user.tag}** does not exist.`);
		}

		await rep.destroy();
		return message.util.reply(`The rep from **${source.user.tag}** to **${target.user.tag}** was deleted.`);
	}
}

module.exports = DeleteRepCommand;
