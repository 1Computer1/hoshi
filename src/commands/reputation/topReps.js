const { Command } = require('discord-akairo');

const { db } = require('../../struct/Database');
const Reputation = require('../../models/reputations');

class TopRepsCommand extends Command {
	constructor() {
		super('topReps', {
			aliases: ['topReps', 'top-reps', 'topRep', 'top-rep', 'repsTop', 'reps-top', 'repTop', 'rep-top'],
			category: 'reputation',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'page',
					type: 'integer',
					default: 1,
					prompt: {
						start: 'Invalid page. Which page would you like to view?',
						retry: 'Please provide a valid page number.',
						optional: true
					}
				}
			]
		});

		this.perPage = 10;
	}

	async exec(message, { page }) {
		const total = await Reputation.count({ where: { guildID: message.guild.id } });
		const topReps = await db.query(`
			SELECT
				COUNT(*) AS amount,
				"targetID"
			FROM reputations
			GROUP BY "targetID" ORDER BY amount DESC
			OFFSET :offset
			LIMIT :limit
		`, {
				type: db.Sequelize.QueryTypes.SELECT,
				replacements: {
					offset: (page - 1) * this.perPage,
					limit: this.perPage
				}
			}
		);

		const users = await Promise.all(topReps.map(async row => {
			const user = await this.client.users.fetch(row.targetID);

			return {
				tag: user ? user.tag : 'Unknown#????',
				amount: row.amount
			};
		}));

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setTitle(`Reputation Leaderboard — Page ${page} of ${Math.ceil(total / this.perPage)}`);

		if (users.length) {
			const desc = users
				.map(({ tag, amount }, index) => `${1 + index + ((page - 1) * this.perPage)}. **${tag} ::** ${amount}`);

			embed.setDescription(desc);
		} else {
			embed.setTitle('Reputation Leaderboard')
				.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}
}

module.exports = TopRepsCommand;
