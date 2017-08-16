const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

const Reputation = require('../../models/reputations');

class RepLeaderboardCommand extends Command {
	constructor() {
		super('rep-leaderboard', {
			aliases: ['rep-leaderboard', 'repleaderboard'],
			category: 'reputation',
			channelRestriction: 'guild',
			args: [
				{
					id: 'page',
					type: 'integer',
					default: 1,
					prompt: {
						start: msg => `${msg.author} **::** What page?`,
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
		const grouped = reps.reduce((result, current) => {
			const index = result.findIndex(rep => rep.targetID === current.targetID);

			if (index > -1) {
				result[index] = {
					id: current.targetID,
					count: result[index].count + 1
				};
			} else {
				result.push({
					id: current.targetID,
					count: 1
				});
			}

			return result;
		}, []);
		const sorted = await Promise.all(grouped.sort((a, b) => a.count - b.count).map(async user => {
			const fetched = await this.client.fetchUser(user.id);

			return {
				id: user.id,
				tag: fetched.tag,
				count: user.count
			};
		}));
		const paginated = sorted.slice((page - 1) * this.perPage, page * this.perPage);


		const embed = new MessageEmbed()
			.setTitle('Reputation Leaderboard');

		if (paginated.length) {
			embed.setDescription(
				paginated
					.map((user, index) => `${index + 1}. **${user.tag} ::** ${user.count}`)
					.join('\n')
			);
		} else {
			embed.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}
}

module.exports = RepLeaderboardCommand;
