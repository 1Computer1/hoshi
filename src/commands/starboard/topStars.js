const { Command } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

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
		const stars = await Star.findAll({
			where: { guildID: message.guild.id },
			attributes: ['authorID', 'starCount']
		});

		const grouped = stars.reduce((obj, curr) => {
			if (!obj[curr.authorID]) obj[curr.authorID] = 0;
			obj[curr.authorID] += curr.starCount;
			return obj;
		}, {});

		const sortedUsers = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

		if ((page - 1) * this.perPage > sortedUsers.length) {
			page = Math.floor(sortedUsers.length / this.perPage) + 1;
		}

		const paginated = sortedUsers.slice((page - 1) * this.perPage, page * this.perPage);

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
			.setTitle(`Star Leaderboard | Page ${page} of ${Math.ceil(sortedUsers.length / page)}`);

		if (paginated.length) {
			const desc = paginated
				.map(([user, count], index) => `${1 + index + ((page - 1) * this.perPage)}. **${user.tag} ::** ${count} \\${Starboard.getStarEmoji(count)}`);

			embed.setDescription(desc);
		} else {
			embed.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}
}

module.exports = TopStarsCommand;
