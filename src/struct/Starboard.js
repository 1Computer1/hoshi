const Star = require('../models/stars');

class Starboard {
	constructor(guild) {
		this.client = guild.client;
		this.guild = guild;

		this.stars = new Map();

		Star.findAll({ where: { guildID: this.guild.id } }).then(stars => {
			for (const star of stars) {
				this.stars.set(star.messageID, star);
			}
		});
	}

	get channel() {
		const channelId = this.client.settings.get(this.guild, 'starboardChannelID');
		return this.guild.channels.get(channelId);
	}

	async add(message, starBy) {
		if (message.author.id === starBy.id) {
			throw new Error('You can\'t star your own messages.');
		}

		if (!this.stars.has(message.id)) {
			const starboardMessage = await this.channel.send({ embed: Starboard.buildStarboardEmbed(message) });

			const star = await Star.create({
				messageID: message.id,
				authorID: message.author.id,
				channelID: message.channel.id,
				guildID: this.guild.id,
				starboardMessageID: starboardMessage.id,
				starredBy: [starBy.id]
			});

			this.stars.set(message.id, star);
		} else {
			const star = this.stars.get(message.id);

			if (star.starredBy.includes(starBy.id)) {
				throw new Error('You have already starred this message before; You can\'t star it again.');
			} else {
				const newStarredBy = star.starredBy.concat([starBy.id]);

				const starboardMessage = await this.channel.fetchMessage(star.starboardMessageID);
				await starboardMessage.edit({ embed: Starboard.buildStarboardEmbed(message, newStarredBy.length) });

				const newStar = await star.update({
					starCount: newStarredBy.length,
					starredBy: newStarredBy
				});

				this.stars.set(message.id, newStar);
			}
		}
	}

	static buildStarboardEmbed(message, starCount = 1) {
		const embed = {
			color: 0xFFAC33,
			fields: [
				{
					name: 'Author',
					value: message.author.toString(),
					inline: true
				},
				{
					name: 'Channel',
					value: message.channel.toString(),
					inline: true
				}
			],
			thumbnail: { url: message.author.displayAvatarURL() },
			timestamp: new Date(),
			footer: { text: `⭐ ${starCount}`}
		};

		if (message.content) {
			embed.fields.push({
				name: 'Message',
				value: message.content
			});
		}

		const attachment = message.attachments.find(a => a.height);
		if (attachment) {
			embed.image = { url: attachment.url };
		}

		return embed;
	}
}

module.exports = Starboard;
