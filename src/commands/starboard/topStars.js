const { Command } = require('discord-akairo');

const Star = require('../../models/stars');

class TopStarsCommand extends Command {
	constructor() {
		super('topStars', {
			aliases: ['topStars', 'top-stars', 'topStar', 'top-star'],
			category: 'starboard',
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
		const allStars = await Star.findAll({
			where: { guildID: message.guild.id },
			attributes: ['authorID', 'starCount']
		});

		const users = [];
		for (const { starCount, authorID } of allStars) {
			const index = users.findIndex(user => user.id === authorID);

			if (index > -1) {
				users[index] = {
					id: users[index].id,
					tag: users[index].tag,
					count: users[index].count + starCount
				};
			} else {
				const fetched = await this.client.fetchUser(authorID); // eslint-disable-line no-await-in-loop

				users.push({
					id: authorID,
					tag: fetched.tag,
					count: starCount
				});
			}
		}

		const sortedUsers = users.sort((a, b) => a.count - b.count);
		if ((page - 1) * this.perPage > sortedUsers.length) {
			page = Math.floor(sortedUsers.length / this.perPage) + 1;
		}

		const paginated = sortedUsers.slice((page - 1) * this.perPage, page * this.perPage);
		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setTitle('Star Leaderboard');

		if (paginated.length) {
			const desc = paginated
				.map((user, index) => `${index + 1}. **${user.tag} ::** ${user.count} \\${this.getStarEmoji(user.count)}`)
				.join('\n');

			embed.setDescription(desc);
		} else {
			embed.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}

	getStarEmoji(count) {
		return count < 3
			? '⭐'
			: count < 5
				? '🌟'
				: count < 10
					? '✨'
					: '🌌';
	}
}

module.exports = TopStarsCommand;
