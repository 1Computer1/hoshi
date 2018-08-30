const { Command } = require('discord-akairo');
const Star = require('../../models/stars');
const Starboard = require('../../struct/Starboard');

class ShowStarsCommand extends Command {
	constructor() {
		super('showStars', {
			aliases: ['show-stars', 'show-star', 'stars'],
			category: 'starboard',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			quoted: false,
			args: [
				{
					'id': 'member',
					'match': 'content',
					'type': 'member',
					'default': message => message.member,
					'prompt': {
						start: 'That user could not be found. Whose stars would you like to view?',
						retry: 'Please provide a valid user.',
						optional: true
					}
				}
			],
			description: {
				content: 'Shows a user\'s accumulated stars and their best starred message.',
				usage: '<user>',
				examples: ['@FunnyGuy']
			}
		});
	}

	async exec(message, { member }) {
		const starboard = this.client.starboards.get(message.guild.id);

		if (!starboard.channel) {
			const prefix = this.handler.prefix(message);
			return message.util.reply(`There isn't a starboard channel to use. Set one using the \`${prefix}starboard\` command!`);
		}

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
				`**Local**: ${plural(guildStars.length, 'message')} — ${totalGuildStars} ${Starboard.getEscapedStarEmoji(totalGuildStars)}`,
				`**Global**: ${plural(stars.length, 'message')} — ${totalStars} ${Starboard.getEscapedStarEmoji(totalStars)}`
			]);

		if (guildStars.length) {
			const topStar = guildStars.sort((a, b) => b.starCount - a.starCount)[0];
			const msg = await message.guild.channels.get(topStar.channelID).messages.fetch(topStar.messageID)
				.catch(() => null);

			let content;
			let attachment;

			if (msg) {
				content = msg.content;
				attachment = Starboard.findAttachment(msg);
			} else if (topStar.starboardMessageID) {
				const starboardMsg = await starboard.channel.messages.fetch(topStar.starboardMessageID).catch(() => null);

				if (starboardMsg) {
					content = starboardMsg.embeds[0].fields[2] && starboardMsg.embeds[0].fields[2].value;
					attachment = starboardMsg.embeds[0].attachment;
				}
			}

			const emoji = Starboard.getEscapedStarEmoji(topStar.starCount);
			embed.addField('Top Star', `${emoji} ${topStar.starCount} (${topStar.messageID})`, true)
				.addField('Channel', `<#${topStar.channelID}>`, true);

			if (content) {
				if (content.length > 1000) {
					content = content.slice(0, 1000);
					content += '...';
				}

				embed.addField('Message', content);
			}

			if (attachment) {
				embed.setImage(attachment);
			}
		}

		return message.util.send({ embed });
	}
}

module.exports = ShowStarsCommand;
