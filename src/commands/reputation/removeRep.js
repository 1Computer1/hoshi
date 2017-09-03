const { Command } = require('discord-akairo');
const Reputation = require('../../models/reputations');

class RemoveRepCommand extends Command {
	constructor() {
		super('removeRep', {
			aliases: ['removeRep', 'remove-rep', 'unrep', '--'],
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
		if (message.author.id === member.id) {
			return message.util.reply('You cannot remove reputation from yourself!');
		}

		const blacklist = this.client.settings.get(message.guild, 'blacklist', []);
		if (blacklist.includes(message.author.id)) {
			return message.util.reply('You can\'t use this command because you have been blacklisted');
		}

		const previous = await Reputation.findOne({
			where: {
				sourceID: message.author.id,
				targetID: member.id,
				guildID: message.guild.id
			}
		});

		if (!previous) {
			return message.util.reply(`You cannot remove reputation from ${member.user.tag} because you never gave them any.`);
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
