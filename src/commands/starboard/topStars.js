const { Command } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

const { db } = require('../../struct/Database');

class TopStarsCommand extends Command {
	constructor() {
		super('topStars', {
			aliases: ['topStars', 'top-stars', 'topStar', 'top-star', 'starsTop', 'star-top', 'starTop', 'stars-top'],
			category: 'starboard',
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
				COUNT(DISTINCT "authorID") 
			FROM stars WHERE "guildID" = :guildID
		`, {
				type: db.Sequelize.QueryTypes.SELECT,
				replacements: { guildID: message.guild.id }
			}
		))[0].count);

		const topStars = await db.query(`
			SELECT
				SUM("starCount") AS amount,
				"authorID"
			FROM stars WHERE "guildID" = :guildID
			GROUP BY "authorID" ORDER BY amount DESC
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

		const users = await Promise.all(topStars.map(async row => {
			const user = await this.client.users.fetch(row.authorID);

			return {
				tag: user ? user.tag : 'Unknown#????',
				amount: row.amount
			};
		}));

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setTitle(`Star Leaderboard — Page ${page} of ${Math.ceil(total / this.perPage)}`);

		if (users.length) {
			const desc = users
				.map(({ tag, amount }, index) => `${1 + index + ((page - 1) * this.perPage)}. **${tag} ::** ${amount} \\${Starboard.getStarEmoji(amount)}`);

			embed.setDescription(desc);
		} else {
			embed.setTitle('Star Leaderboard')
				.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}
}

module.exports = TopStarsCommand;
