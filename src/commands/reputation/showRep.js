const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

const Reputation = require('../../models/reputations');

class ShowRepCommand extends Command {
	constructor() {
		super('showRep', {
			aliases: ['showRep', 'show-rep'],
			category: 'reputation',
			channelRestriction: 'guild',
			split: 'quoted',
			args: [
				{
					id: 'member',
					type: 'member',
					default: message => message.author,
					prompt: {
						start: msg => `${msg.author} **::** Whose reputation would you like to view?`,
						retry: msg => `${msg.author} **::** Please provide a valid user.`,
						optional: true
					}
				},
				{
					id: 'page',
					type: 'integer',
					default: 1,
					prompt: {
						start: msg => `${msg.author} **::** What page?`,
						retry: msg => `${msg.author} **::** Please provide a valid page number.`,
						optional: true
					}
				}
			]
		});

		this.perPage = 5;
	}

	async exec(message, { member, page }) {
		const reputations = await Reputation.findAll({ where: { targetID: member.id } });
		const guildReputations = reputations.filter(rep => rep.guildID === message.guild.id);
		const paginated = guildReputations.slice((page - 1) * this.perPage, page * this.perPage);
		const sources = await Promise.all(paginated.map(rep => this.client.fetchUser(rep.sourceID)));

		const embed = new MessageEmbed()
			.setColor(0xFFAC33)
			.setAuthor(member.user.tag)
			.setThumbnail(member.user.displayAvatarURL())
			.addField('Reputation', `**Guild**: ${guildReputations.length}\n**Global**: ${reputations.length}`)
			.addField('Reasons', paginated.map((rep, index) => `**${sources[index].tag} ::** ${rep.reason}`).join('\n'));

		return message.util.send({ embed });
	}
}

module.exports = ShowRepCommand;
