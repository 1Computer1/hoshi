const { Command } = require('discord-akairo');
const { db } = require('../../struct/Database');

class TopRepsCommand extends Command {
	constructor() {
		super('topReps', {
			aliases: ['top-reps', 'top-rep', 'reps-top', 'rep-top'],
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
		const total = Number((await db.query(`
			SELECT
				COUNT(DISTINCT "targetID")
			FROM reputations WHERE "guildID" = :guildID
		`, {
				type: db.Sequelize.QueryTypes.SELECT,
				replacements: { guildID: message.guild.id }
			}
		))[0].count);

		const topReps = await db.query(`
			SELECT
				COUNT(*) AS amount,
				"targetID"
			FROM reputations
			WHERE "guildID" = :guildID
			GROUP BY "targetID" ORDER BY amount DESC
			OFFSET :offset
			LIMIT :limit
		`, {
				type: db.Sequelize.QueryTypes.SELECT,
				replacements: {
					guildID: message.guild.id,
					offset: (page - 1) * this.perPage,
					limit: this.perPage
				}
			}
		);

		const users = await Promise.all(topReps.map(async row => {
			const user = await this.client.users.fetch(row.targetID).catch(() => ({ tag: 'Unknown#????' }));

			return {
				tag: user.tag,
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
