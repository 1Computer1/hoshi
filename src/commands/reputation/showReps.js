const { Command } = require('discord-akairo');

const Reputation = require('../../models/reputations');

class ShowRepsCommand extends Command {
	constructor() {
		super('showReps', {
			aliases: ['showReps', 'show-reps', 'showRep', 'show-rep'],
			category: 'reputation',
			channelRestriction: 'guild',
			clientPermissions: ['EMBED_LINKS'],
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

		const plural = (num, str) => Math.abs(num) === 1 ? `${num} ${str}` : `${num} ${str}s`;

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setThumbnail(member.user.displayAvatarURL)
			.setTitle(`User Information for ${member.user.tag}`)
			.addField('Reputation Count', [
				`**Local**: ${plural(guildReputations.length, 'rep')}`,
				`**Global**: ${plural(reputations.length, 'rep')}`
			]);

		if ((page - 1) * this.perPage > guildReputations.length) {
			page = Math.floor(guildReputations.length / this.perPage) + 1;
		}

		if (guildReputations.length) {
			const paginated = guildReputations.slice((page - 1) * this.perPage, page * this.perPage);
			const sources = await Promise.all(paginated.map(rep => this.client.fetchUser(rep.sourceID)));

			embed.addField(`Reasons — Page ${page} of ${Math.ceil(guildReputations.length / this.perPage)}`, paginated.map((rep, index) => {
				let text = rep.reason.substring(0, 160);
				if (rep.reason.length > 160) text += '...';
				return `**${sources[index].tag} ::** ${text}`;
			}));
		}

		return message.util.send({ embed });
	}
}

module.exports = ShowRepsCommand;
