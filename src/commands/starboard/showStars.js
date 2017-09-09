const { Command } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

const Star = require('../../models/stars');

class ShowStarsCommand extends Command {
	constructor() {
		super('showStars', {
			aliases: ['showStars', 'show-stars', 'showStar', 'show-star', 'stars'],
			category: 'starboard',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'member',
					match: 'content',
					type: 'member',
					default: message => message.member,
					prompt: {
						start: 'That user could not be found. Whose reputation would you like to view?',
						retry: 'Please provide a valid member.',
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
			.setThumbnail(member.user.displayAvatarURL())
			.setTitle(`User Information for ${member.user.tag}`)
			.addField('Star Count', [
				`**Local**: ${plural(guildStars.length, 'message')} — ${totalGuildStars} \\${Starboard.getStarEmoji(totalGuildStars)}`,
				`**Global**: ${plural(stars.length, 'message')} — ${totalStars} \\${Starboard.getStarEmoji(totalStars)}`
			]);

		if (guildStars.length) {
			const topStar = guildStars.sort((a, b) => b.starCount - a.starCount)[0];
			const msg = await message.guild.channels.get(topStar.channelID).messages.fetch(topStar.messageID)
				.catch(() => null);

			let content;

			if (msg) {
				content = msg.content;
			} else {
				const starboard = this.client.starboards.get(message.guild.id);
				const starboardMsg = await starboard.channel.messages.fetch(topStar.starboardMessageID);
				content = starboardMsg.embeds[0].fields[2] && starboardMsg.embeds[0].fields[2].value;
			}

			if (content.length > 1000) {
				content = content.slice(0, 1000);
				content += '...';
			}

			const emoji = Starboard.getStarEmoji(topStar.starCount);
			embed.addField('Top Star', `\\${emoji} ${topStar.starCount} (${topStar.messageID})`, true)
				.addField('Channel', `<#${topStar.channelID}>`, true);

			if (content) embed.addField('Message', content);
		}

		return message.util.send({ embed });
	}
}

module.exports = ShowStarsCommand;
