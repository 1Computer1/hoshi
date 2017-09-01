const { Command } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

const Star = require('../../models/stars');

class ShowStarsCommand extends Command {
	constructor() {
		super('showStars', {
			aliases: ['showStars', 'show-stars', 'showStar', 'show-star'],
			category: 'starboard',
			channelRestriction: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'member',
					match: 'content',
					type: 'member',
					default: message => message.member,
					prompt: {
						start: msg => `${msg.author} **::** That user could not be found. Whose reputation would you like to view?`,
						retry: msg => `${msg.author} **::** Please provide a valid member.`,
						optional: true
					}
				}
			]
		});
	}

	async exec(message, { member }) {
		const stars = await Star.findAll({ where: { authorID: member.id } });
		const guildStars = stars.filter(star => star.guildID === message.guild.id);

		const totalStars = stars.reduce((res, curr) => res + curr.starCount, 0);
		const totalGuildStars = guildStars.reduce((res, curr) => res + curr.starCount, 0);

		const plural = (num, str) => Math.abs(num) === 1 ? `${num} ${str}` : `${num} ${str}s`;

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setThumbnail(member.user.displayAvatarURL)
			.setTitle(`User Information for ${member.user.tag}`)
			.addField('Star Count', [
				`**Local**: ${plural(guildStars.length, 'message')} — ${totalGuildStars} \\${Starboard.getStarEmoji(totalGuildStars)}`,
				`**Global**: ${plural(stars.length, 'message')} — ${totalStars} \\${Starboard.getStarEmoji(totalStars)}`
			]);

		if (guildStars.length) {
			const topStar = guildStars.sort((a, b) => b.starCount - a.starCount)[0];
			const msg = await message.guild.channels.get(topStar.channelID).fetchMessage(topStar.messageID).catch(() => null);

			if (msg) {
				let content = msg.content.substring(0, 1000);
				if (msg.content.length > 1000) content += '...';

				const emoji = Starboard.getStarEmoji(topStar.starCount);
				embed.addField('Top Star', `\\${emoji} ${topStar.starCount} (${msg.id})`, true)
					.addField('Channel', msg.channel, true)
					.addField(`Message`, content || '\u200B');
			}
		}

		return message.util.send({ embed });
	}
}

module.exports = ShowStarsCommand;
