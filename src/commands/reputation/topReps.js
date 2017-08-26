const { Command } = require('discord-akairo');

const Reputation = require('../../models/reputations');

class TopRepsCommand extends Command {
	constructor() {
		super('topReps', {
			aliases: ['topReps', 'top-reps', 'topRep', 'top-rep'],
			category: 'reputation',
			channelRestriction: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			args: [
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

		this.perPage = 10;
	}

	async exec(message, { page }) {
		const reps = await Reputation.findAll({ where: { guildID: message.guild.id } });
		const grouped = reps.reduce((obj, curr) => {
			if (!obj[curr.targetID]) obj[curr.targetID] = 0;
			obj[curr.targetID]++;
			return obj;
		}, {});

		const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

		if ((page - 1) * this.perPage > sorted.length) {
			page = Math.floor(sorted.length / this.perPage) + 1;
		}

		const paginated = sorted.slice((page - 1) * this.perPage, page * this.perPage);

		const promises = [];
		for (let i = 0; i < paginated.length; i++) {
			const id = paginated[i][0];
			promises.push(this.client.fetchUser(id).then(user => {
				paginated[i][0] = user;
			}));
		}

		await Promise.all(promises);

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setTitle('Reputation Leaderboard');

		if (paginated.length) {
			const desc = paginated
				.map(([user, amount], index) => `${index + 1}. **${user.tag} ::** ${amount}`);

			embed.setDescription(desc);
		} else {
			embed.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}
}

module.exports = TopRepsCommand;
