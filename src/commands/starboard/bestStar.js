const { Command } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

const Star = require('../../models/stars');

class BestStarCommand extends Command {
	constructor() {
		super('bestStar', {
			aliases: ['bestStar', 'best-star', 'starBest', 'star-best'],
			category: 'starboard',
			channelRestriction: 'guild',
			clientPermissions: ['EMBED_LINKS']
		});
	}

	async exec(message) {
		const stars = await Star.findAll({ where: { guildID: message.guild.id } });
		const embed = this.client.util.embed().setColor(0xFFAC33);

		if (stars.length) {
			const topStar = stars.sort((a, b) => b.starCount - a.starCount)[0];
			const msg = await message.guild.channels.get(topStar.channelID).fetchMessage(topStar.messageID).catch(() => null);

			let content;
			let tag;
			let displayAvatarURL;

			if (msg) {
				content = msg.content;
			} else {
				const starboard = this.client.starboards.get(message.guild.id);
				const starboardMsg = await starboard.channel.fetchMessage(topStar.starboardMessageID);
				content = starboardMsg.embeds[0].fields[2] && starboardMsg.embeds[0].fields[2].value;
				tag = 'Unknown#????';
				displayAvatarURL = starboardMsg.embeds[0].thumbnail.url;
			}

			if (content.length > 1000) {
				content = content.slice(0, 1000);
				content += '...';
			}

			const user = await this.client.fetchUser(topStar.authorID).catch(() => ({ tag, displayAvatarURL }));
			const emoji = Starboard.getStarEmoji(topStar.starCount);

			embed.setTitle(`Best of ${message.guild.name} — ${user.tag}`)
				.setThumbnail(user.displayAvatarURL)
				.addField('Top Star', `\\${emoji} ${topStar.starCount} (${topStar.messageID})`, true)
				.addField('Channel', `<#${topStar.channelID}>`, true);

			if (content) embed.addField(`Message`, content);
		} else {
			embed.setTitle(`Best of ${message.guild.name}`)
				.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}
}

module.exports = BestStarCommand;
