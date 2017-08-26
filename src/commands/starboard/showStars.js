const { Command } = require('discord-akairo');

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

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setThumbnail(member.user.displayAvatarURL())
			.setTitle(`User Information for ${member.user.tag}`)
			.addField('Star Count', [
				`**Local**: ${guildStars.length}`,
				`**Global**: ${stars.length}`
			]);

		if (guildStars.length) {
			const topStar = guildStars.sort((a, b) => a.starCount - b.starCount)[0];
			const msg = await message.guild.channels.get(topStar.channelID).fetchMessage(topStar.messageID).catch(() => null);

			if (msg) {
				let content = message.content.substring(0, 1000);
				if (message.content.length > 1000) content += '...';

				const emoji = topStar.starCount < 3
					? '⭐'
					: topStar.starCount < 5
						? '🌟'
						: topStar.starCount < 10
							? '✨'
							: '🌌';

				embed.addField('Top Star', `\\${emoji} ${topStar.starCount} (${msg.id})`, true)
					.addField('Channel', msg.channel, true)
					.addField(`Message`, content || '\u200B');
			}
		}

		return message.util.send({ embed });
	}
}

module.exports = ShowStarsCommand;
