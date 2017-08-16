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
					default: message => message.member,
					prompt: {
						start: msg => `${msg.author} **::** That user could not be found. Whose reputation would you like to view?`,
						retry: msg => `${msg.author} **::** Please provide a valid user.`,
						optional: true
					}
				},
				{
					id: 'page',
					type: 'integer',
					default: 1,
					prompt: {
						start: msg => `${msg.author} **::** Invalid page. Which page would you like to view?`,
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

		const embed = new MessageEmbed()
			.setColor(0xFFAC33)
			.setThumbnail(member.user.displayAvatarURL())
			.setTitle(`User Information for ${member.user.tag}`)
			.addField('Reputation Count', [
				`**Local**: ${guildReputations.length}`,
				`**Global**: ${reputations.length}`
			]);

		if ((page - 1) * this.perPage > guildReputations.length) {
			page = Math.floor(guildReputations.length / this.perPage) + 1;
		}

		if (guildReputations.length) {
			const paginated = guildReputations.slice((page - 1) * this.perPage, page * this.perPage);
			const sources = await Promise.all(paginated.map(rep => this.client.fetchUser(rep.sourceID)));

			embed.addField(`Reasons (Page ${page})`, paginated.map((rep, index) => {
				let text = rep.reason.substring(0, 160);
				if (rep.reason.length > 160) text += '...';
				return `**${sources[index].tag} ::** ${text}`;
			}).join('\n'));
		}

		return message.util.send({ embed });
	}
}

module.exports = ShowRepCommand;
