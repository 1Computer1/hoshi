const { Argument, Command } = require('discord-akairo');
const { db } = require('../../struct/Database');
const Starboard = require('../../struct/Starboard');

class TopStarsCommand extends Command {
	constructor() {
		super('topStars', {
			aliases: ['top-stars', 'top-star', 'star-top', 'stars-top'],
			category: 'starboard',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			quoted: false,
			args: [
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
				content: 'Displays a list of users sorted by how many stars they have in the guild.',
				usage: '[page]',
				examples: ['', '3']
			}
		});

		this.perPage = 10;
	}

	async exec(message, { page }) {
		const starboard = this.client.starboards.get(message.guild.id);

		if (!starboard.channel) {
			const prefix = this.handler.prefix(message);
			return message.util.reply(`There isn't a starboard channel to use. Set one using the \`${prefix}starboard\` command!`);
		}

		const total = Number((await db.query(`
			SELECT
				COUNT(DISTINCT "authorID")
			FROM stars WHERE "guildID" = :guildID
		`, {
			type: db.Sequelize.QueryTypes.SELECT,
			replacements: { guildID: message.guild.id }
		}))[0].count);

		const topStars = await db.query(`
			SELECT
				SUM("starCount") AS amount,
				"authorID"
			FROM stars
			WHERE "guildID" = :guildID
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
		});

		const users = await Promise.all(topStars.map(async row => {
			const user = await this.client.users.fetch(row.authorID).catch(() => ({ tag: 'Unknown#????' }));

			return {
				tag: user.tag,
				amount: row.amount
			};
		}));

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setTitle(`Star Leaderboard — Page ${page} of ${Math.ceil(total / this.perPage)}`);

		if (users.length) {
			const desc = users
				.map(({ tag, amount }, index) => `${1 + index + ((page - 1) * this.perPage)}. **${tag} ::** ${amount} ${Starboard.getEscapedStarEmoji(amount)}`);

			embed.setDescription(desc);
		} else {
			embed.setTitle('Star Leaderboard')
				.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}
}

module.exports = TopStarsCommand;
