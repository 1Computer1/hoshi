const { Command } = require('discord-akairo');
const Sequelize = require('sequelize');

const Starboard = require('../../struct/Starboard');
const Star = require('../../models/stars');

class BestStarCommand extends Command {
	constructor() {
		super('bestStar', {
			aliases: ['bestStar', 'best-star', 'starBest', 'star-best'],
			category: 'starboard',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS']
		});
	}

	async exec(message) {
		const [bestStar] = await Star.findAll({
			where: { guildID: message.guild.id },
			order: Sequelize.literal('"starCount" DESC')
		});

		const embed = this.client.util.embed().setColor(0xFFAC33);

		if (bestStar) {
			const msg = await message.guild.channels.get(bestStar.channelID)
				.messages.fetch(bestStar.messageID).catch(() => null);

			let content;
			let tag;
			let displayAvatarURL;

			if (msg) {
				content = msg.content;
			} else {
				const starboard = this.client.starboards.get(message.guild.id);
				const starboardMsg = await starboard.channel.messages.fetch(bestStar.starboardMessageID);
				content = starboardMsg.embeds[0].fields[2] && starboardMsg.embeds[0].fields[2].value;
				tag = 'Unknown#????';
				displayAvatarURL = () => starboardMsg.embeds[0].thumbnail.url;
			}

			if (content.length > 1000) {
				content = content.slice(0, 1000);
				content += '...';
			}

			const user = await this.client.users.fetch(bestStar.authorID).catch(() => ({ tag, displayAvatarURL }));
			const emoji = Starboard.getStarEmoji(bestStar.starCount);

			embed.setTitle(`Best of ${message.guild.name} — ${user.tag}`)
				.setThumbnail(user.displayAvatarURL())
				.addField('Top Star', `\\${emoji} ${bestStar.starCount} (${bestStar.messageID})`, true)
				.addField('Channel', `<#${bestStar.channelID}>`, true);

			if (content) embed.addField('Message', content);
		} else {
			embed.setTitle(`Best of ${message.guild.name}`)
				.setDescription('*Nothing to show here yet...*');
		}

		return message.util.send({ embed });
	}
}

module.exports = BestStarCommand;
