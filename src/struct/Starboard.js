const { MessageEmbed } = require('discord.js');
const path = require('path');
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
		const channelID = this.client.settings.get(this.guild, 'starboardChannelID');
		return this.guild.channels.get(channelID);
	}

	async add(message, starredBy) {
		if (!this.channel) {
			return 'There isn\'t a starboard channel to use.';
		}

		if (message.author.id === starredBy.id) {
			return 'You can\'t star your own messages.';
		}

		const missingPerms = this.missingPermissions();
		if (missingPerms) {
			return missingPerms;
		}

		if (!this.stars.has(message.id)) {
			const starboardMessage = await this.channel.send({ embed: Starboard.buildStarboardEmbed(message) });

			const star = await Star.create({
				messageID: message.id,
				authorID: message.author.id,
				channelID: message.channel.id,
				guildID: this.guild.id,
				starboardMessageID: starboardMessage.id,
				starredBy: [starredBy.id]
			});

			this.stars.set(message.id, star);
		} else {
			const star = this.stars.get(message.id);

			if (star.starredBy.includes(starredBy.id)) {
				return 'You have already starred this message before; You can\'t star it again.';
			} else {
				const newStarredBy = star.starredBy.concat([starredBy.id]);

				const starboardMessage = await this.channel.fetchMessage(star.starboardMessageID);
				await starboardMessage.edit({ embed: Starboard.buildStarboardEmbed(message, newStarredBy.length) });

				const newStar = await star.update({
					starCount: newStarredBy.length,
					starredBy: newStarredBy
				});

				this.stars.set(message.id, newStar);
			}
		}

		return undefined;
	}

	async remove(message, unstarredBy) {
		if (!this.channel) {
			return 'There isn\'t a starboard channel to use.';
		}

		const star = this.stars.get(message.id);
		if (!star || !star.starredBy.includes(unstarredBy.id)) {
			return 'You can\'t remove any star from this message because you never gave it one in the first place.';
		}

		const missingPerms = this.missingPermissions();
		if (missingPerms) {
			return missingPerms;
		}

		if (message.reactions.has('⭐') && message.reactions.get('⭐').users.has(unstarredBy.id)) {
			await message.reactions.get('⭐').remove(unstarredBy);
		}

		const newStarredBy = star.starredBy.filter(id => id !== unstarredBy.id);

		const starboardMessage = await this.channel.fetchMessage(star.starboardMessageID);
		if (newStarredBy.length) {
			await starboardMessage.edit({ embed: Starboard.buildStarboardEmbed(message, newStarredBy.length) });

			const newStar = await star.update({
				starCount: newStarredBy.length,
				starredBy: newStarredBy
			});

			this.stars.set(message.id, newStar);
		} else {
			await starboardMessage.delete();
			await star.destroy();
			this.stars.delete(message.id);
		}

		return undefined;
	}

	destroy() {
		return Star.destroy({ where: { guildID: this.guild.id } });
	}

	missingPermissions() {
		const missingPermissions = this.client.listenerHandler.modules.get('commandBlocked').missingPermissions;
		const str = missingPermissions(this.channel, this.client.user, [
			'MANAGE_MESSAGES',
			'SEND_MESSAGES',
			'READ_MESSAGE_HISTORY'
		]);

		return `I'm missing ${str} in ${this.channel}.`;
	}

	static findAttachment(message) {
		let attachmentImage;
		const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
		const linkRegex = /https?:\/\/(?:\w+\.)?[\w-]+\.[\w]{2,3}(?:\/[\w-_.]+)+\.(?:png|jpg|jpeg|gif|webp)/;

		if (message.attachments.some(attachment => extensions.includes(path.extname(attachment.url)))) {
			attachmentImage = message.attachments.first().url;
		}

		if (!attachmentImage) {
			const linkMatch = message.content.match(linkRegex);
			if (linkMatch && extensions.includes(path.extname(linkMatch[0]))) {
				attachmentImage = linkMatch[0];
			}
		}

		return attachmentImage;
	}

	static buildStarboardEmbed(message, starCount = 1) {
		const embed = new MessageEmbed()
			.setColor(0xFFAC33)
			.addField('Author', message.author, true)
			.addField('Channel', message.channel, true)
			.setThumbnail(message.author.displayAvatarURL())
			.setTimestamp(message.createdAt)
			.setFooter(`⭐ ${starCount}`);

		if (message.content) {
			embed.addField('Message', message.content);
		}

		const attachment = this.findAttachment(message);
		if (attachment) {
			embed.setImage(attachment);
		}

		return embed;
	}
}

module.exports = Starboard;
