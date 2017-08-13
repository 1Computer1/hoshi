const { Command } = require('discord-akairo');
const Reputation = require('../../models/reputations');

class RemoveRepCommand extends Command {
	constructor() {
		super('removeRep', {
			aliases: ['removeRep', 'remove-rep', 'deleteRep', 'delete-rep', 'delRep', 'del-rep', 'derep', 'unrep', '--'],
			category: 'reputation',
			channelRestriction: 'guild',
			args: [
				{
					id: 'member',
					match: 'content',
					type: 'member',
					prompt: {
						start: msg => `${msg.author} **::** Which user do you want to remove reputation from?`,
						retry: msg => `${msg.author} **::** You did not supply a valid user. Please try again.`
					}
				}
			]
		});
	}

	async exec(message, { member }) {
		const previous = await Reputation.findOne({
			where: {
				sourceID: message.author.id,
				targetID: member.id,
				guildID: message.guild.id
			}
		});

		if (!previous) {
			return message.util.reply(`You cannot remove reputation from ${member} because you never gave them any.`);
		}

		await Reputation.destroy({
			where: {
				sourceID: message.author.id,
				targetID: member.id,
				guildID: message.guild.id
			}
		});

		return message.util.reply(`You have removed reputation from ${member}.`);
	}
}

module.exports = RemoveRepCommand;
