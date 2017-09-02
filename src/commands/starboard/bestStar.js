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

			if (msg) {
				let content = msg.content.substring(0, 1000);
				if (msg.content.length > 1000) content += '...';

				const emoji = Starboard.getStarEmoji(topStar.starCount);
				embed.setTitle(`Best of ${message.guild.name} — ${msg.author.tag}`)
					.setThumbnail(msg.author.displayAvatarURL)
					.addField('Best Star', `\\${emoji} ${topStar.starCount} (${msg.id})`, true)
					.addField('Channel', msg.channel, true)
					.addField(`Message`, content || '\u200B');
			}
		} else {
			embed.setTitle(`Best Star of ${message.guild.name}`)
				.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}
}

module.exports = BestStarCommand;
