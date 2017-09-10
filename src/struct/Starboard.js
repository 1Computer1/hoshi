const path = require('path');
const Star = require('../models/stars');
const Queue = require('./Queue');

class Starboard {
	constructor(guild) {
		this.client = guild.client;
		this.guild = guild;
		this.stars = new Map();
		this.queues = new Map();
		this.initiated = false;

		Star.findAll({ where: { guildID: this.guild.id } }).then(stars => {
			for (const star of stars) {
				this.stars.set(star.messageID, star);
			}

			this.initiated = true;
		});
	}

	get channel() {
		const channelID = this.client.settings.get(this.guild, 'starboardChannelID');
		return this.guild.channels.get(channelID);
	}

	queue(message, promiseFunc) {
		let queue = this.queues.get(message.id);
		if (!queue) {
			this.queues.set(message.id, new Queue());
			queue = this.queues.get(message.id);
		}

		return new Promise(resolve => {
			queue.add(() => promiseFunc().then(res => {
				if (!queue.length) this.queues.delete(message.id);
				resolve(res);
			}));
		});
	}

	add(message, starredBy) {
		if (!this.initiated) {
			return 'Starboard has not fully loaded, please wait.';
		}

		const blacklist = this.client.settings.get(message.guild, 'blacklist', []);
		if (blacklist.includes(starredBy.id)) {
			return 'You have been blacklisted from using the starboard';
		}

		if (!this.channel) {
			const prefix = this.client.commandHandler.prefix(message);
			return `There isn't a starboard channel to use. Set one using the \`${prefix}starboard\` command!`;
		}

		const missingPerms = this.missingPermissions();
		if (missingPerms) {
			return missingPerms;
		}

		if (message.author.id === starredBy.id) {
			return 'You can\'t star your own messages.';
		}

		return this.queue(message, this.addStar.bind(this, message, starredBy));
	}

	async addStar(message, starredBy) {
		if (this.stars.has(message.id)) {
			const star = this.stars.get(message.id);
			if (star.starredBy.includes(starredBy.id)) {
				return 'You have already starred this message before; You can\'t star it again.';
			}
		}

		if (!this.stars.has(message.id)) {
			const starboardMessage = await this.channel.send({ embed: this.buildStarboardEmbed(message) });

			const star = await Star.create({
				messageID: message.id,
				authorID: message.author.id,
				channelID: message.channel.id,
				guildID: this.guild.id,
				starboardMessageID: starboardMessage.id,
				starredBy: [starredBy.id]
			});

			this.stars.set(message.id, star);
			return undefined;
		}

		const star = this.stars.get(message.id);
		const newStarredBy = star.starredBy.concat([starredBy.id]);

		const embed = this.buildStarboardEmbed(message, newStarredBy.length);
		const starboardMessage = await this.channel.fetchMessage(star.starboardMessageID)
			.then(msg => msg.edit({ embed }))
			.catch(() => this.channel.send({ embed }));

		const newStar = await star.update({
			starCount: newStarredBy.length,
			starredBy: newStarredBy,
			starboardMessageID: starboardMessage.id
		});

		this.stars.set(message.id, newStar);
		return undefined;
	}

	remove(message, unstarredBy) {
		if (!this.initiated) return undefined;

		const blacklist = this.client.settings.get(message.guild, 'blacklist', []);
		if (blacklist.includes(unstarredBy.id)) return undefined;
		if (message.author.id === unstarredBy.id) return undefined;

		if (!this.channel) return undefined;
		if (this.missingPermissions()) return undefined;

		return this.queue(message, this.removeStar.bind(this, message, unstarredBy));
	}

	async removeStar(message, unstarredBy) {
		const star = this.stars.get(message.id);
		if (!star || !star.starredBy.includes(unstarredBy.id)) {
			return undefined;
		}

		if (message.reactions.has('⭐')) {
			const reaction = message.reactions.get('⭐');
			if (reaction.users.has(unstarredBy.id)) {
				await reaction.remove(unstarredBy);
			}
		}

		const newStarredBy = star.starredBy.filter(id => id !== unstarredBy.id);

		if (newStarredBy.length) {
			const embed = this.buildStarboardEmbed(message, newStarredBy.length);
			const starboardMessage = await this.channel.fetchMessage(star.starboardMessageID)
				.then(msg => msg.edit({ embed }))
				.catch(() => this.channel.send({ embed }));

			const newStar = await star.update({
				starCount: newStarredBy.length,
				starredBy: newStarredBy,
				starboardMessageID: starboardMessage.id
			});

			this.stars.set(message.id, newStar);
			return undefined;
		}

		await this.channel.fetchMessage(star.starboardMessageID).then(msg => msg.delete()).catch(() => null);
		await star.destroy();
		this.stars.delete(message.id);
		return undefined;
	}

	delete(message) {
		if (!this.initiated) return undefined;
		if (this.missingPermissions()) return undefined;
		return this.queue(message, this.deleteStar.bind(this, message));
	}

	async deleteStar(message) {
		const star = this.stars.get(message.id);
		if (!star) return undefined;

		const starboardMessage = await this.channel.fetchMessage(star.starboardMessageID).catch(() => null);
		if (starboardMessage) {
			await starboardMessage.delete();
		}

		await star.destroy();
		this.stars.delete(message.id);
		return undefined;
	}

	fix(message) {
		if (!this.initiated) return 'Starboard has not fully loaded, please wait.';
		const missingPerms = this.missingPermissions();
		if (missingPerms) return missingPerms;

		return this.queue(message, this.fixStar.bind(this, message));
	}

	async fixStar(message) {
		let star = this.stars.get(message.id);

		if (!star) {
			if (!message.reactions.has('⭐')) return;

			const users = await message.reactions.get('⭐').fetchUsers();
			const starredBy = users
				.map(user => user.id)
				.filter(user => message.author.id !== user);

			if (!starredBy.length) return;

			const embed = this.buildStarboardEmbed(message, starredBy.length);
			const starboardMessage = await this.channel.send({ embed });
			const newStar = await Star.create({
				starredBy,
				messageID: message.id,
				authorID: message.author.id,
				channelID: message.channel.id,
				guildID: this.guild.id,
				starboardMessageID: starboardMessage.id
			});

			this.stars.set(message.id, newStar);
		} else {
			const users = await message.reactions.get('⭐').fetchUsers();
			const newStarredBy = users
				.map(user => user.id)
				.filter(user => !star.starredBy.includes(user) && message.author.id !== user)
				.concat(star.starredBy);

			const embed = this.buildStarboardEmbed(message, newStarredBy.length);
			const starboardMessage = await this.channel.fetchMessage(star.starboardMessageID)
				.then(msg => msg.edit({ embed }))
				.catch(() => this.channel.send({ embed }));

			const newStar = await star.update({
				starCount: newStarredBy.length,
				starredBy: newStarredBy,
				starboardMessageID: starboardMessage.id
			});

			this.stars.set(message.id, newStar);
		}
	}

	destroy() {
		return Star.destroy({ where: { guildID: this.guild.id } });
	}

	missingPermissions() {
		const { missingPermissions } = this.client.listenerHandler.modules.get('commandBlocked');
		const str = missingPermissions(this.channel, this.client.user, [
			'READ_MESSAGES',
			'MANAGE_MESSAGES',
			'READ_MESSAGE_HISTORY',
			'SEND_MESSAGES',
			'EMBED_LINKS'
		]);

		if (!str) return undefined;
		return `I'm missing ${str} in ${this.channel}.`;
	}

	buildStarboardEmbed(message, starCount = 1) {
		const star = Starboard.getStarEmoji(starCount);
		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.addField('Author', message.author, true)
			.addField('Channel', message.channel, true)
			.setThumbnail(message.author.displayAvatarURL)
			.setTimestamp(message.createdAt)
			.setFooter(`${star} ${starCount} | ${message.id}`);

		if (message.content) {
			let content = message.content.substring(0, 1000);
			if (message.content.length > 1000) content += '...';
			embed.addField('Message', content);
		}

		const attachment = Starboard.findAttachment(message);
		if (attachment) {
			embed.setImage(attachment);
		}

		return embed;
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

	static getStarEmoji(count) {
		if (count < 5) return '⭐';
		if (count < 10) return '🌟';
		if (count < 15) return '✨';
		if (count < 20) return '💫';
		if (count < 30) return '🎇';
		if (count < 50) return '🎆';
		if (count < 75) return '☄️';
		if (count < 100) return '🌠';
		return '🌌';
	}
}

module.exports = Starboard;
