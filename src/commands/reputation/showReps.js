const { Argument, Command } = require('discord-akairo');
const Reputation = require('../../models/reputations');

class ShowRepsCommand extends Command {
	constructor() {
		super('showReps', {
			aliases: ['show-reps', 'show-rep'],
			category: 'reputation',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					'id': 'member',
					'type': 'member',
					'default': message => message.member,
					'prompt': {
						start: 'That user could not be found. Whose reputation would you like to view?',
						retry: 'Please provide a valid user.',
						optional: true
					}
				},
				{
					'id': 'page',
					'type': Argument.range('integer', 0, Infinity),
					'default': 1,
					'prompt': {
						start: 'Invalid page. Which page would you like to view?',
						retry: 'Please provide a valid page number.',
						optional: true
					}
				}
			],
			description: {
				content: 'Shows a user\'s accumulated reputation.',
				usage: '<user> [page]',
				examples: ['@JimBob', 'PopularDude#4232 10']
			}
		});

		this.perPage = 5;
	}

	async exec(message, { member, page }) {
		const reputations = await Reputation.findAll({ where: { targetID: member.id } });
		const guildReputations = reputations.filter(rep => rep.guildID === message.guild.id);

		const plural = (num, str) => Math.abs(num) === 1 ? `${num} ${str}` : `${num} ${str}s`;

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setThumbnail(member.user.displayAvatarURL())
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
			const promises = paginated.map(rep => this.client.users.fetch(rep.sourceID).catch(() => ({ tag: 'Unknown#????' })));
			const sources = await Promise.all(promises);

			embed.addField(`Reasons — Page ${page} of ${Math.ceil(guildReputations.length / this.perPage)}`, paginated.map((rep, index) => {
				if (!rep.reason) return `**${sources[index].tag}**`;
				let text = rep.reason.substring(0, 160);
				if (rep.reason.length > 160) text += '...';
				return `**${sources[index].tag} ::** ${text}`;
			}));
		}

		return message.util.send({ embed });
	}
}

module.exports = ShowRepsCommand;
