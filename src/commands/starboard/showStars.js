const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

const Star = require('../../models/stars');

class ShowStarCommand extends Command {
	constructor() {
		super('showStars', {
			aliases: ['showStars', 'show-stars', 'showStar', 'show-star'],
			category: 'starboard',
			channelRestriction: 'guild',
			args: [
				{
					id: 'member',
					match: 'content',
					type: 'member',
					default: message => message.member,
					prompt: {
						start: msg => `${msg.author} **::** Whose reputation would you like to view?`,
						retry: msg => `${msg.author} **::** Please provide a valid member.`,
						optional: true
					}
				}
			]
		});

		this.perPage = 5;
	}

	async exec(message, { member }) {
		const stars = await Star.findAll({ where: { authorID: member.id } });
		const guildStars = stars.filter(star => star.guildID === message.guild.id);
		const topStar = stars.sort((a, b) => a.starCount - b.starCount)[0];
		const topStarMessage = await message.guild.channels.get(topStar.channelID).fetchMessage(topStar.messageID);

		const embed = new MessageEmbed()
			.setColor(0xFFAC33)
			.setAuthor(member.user.tag)
			.setThumbnail(member.user.displayAvatarURL())
			.addField('Stars', `**Guild**: ${guildStars.length}\n**Global**: ${stars.length}`)
			.addField('Top Star', [
				topStarMessage.content,
				`- ${member.user.username} in ${topStarMessage.channel} (${topStar.starCount} \\⭐)`
			]);

		return message.util.send({ embed });
	}
}

module.exports = ShowStarCommand;
