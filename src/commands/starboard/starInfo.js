const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class StarInfoCommand extends Command {
	constructor() {
		super('starInfo', {
			aliases: ['starInfo', 'star-info'],
			category: 'starboard',
			channelRestriction: 'guild',
			args: [
				// Indices are swapped in order to process channel first.
				{
					id: 'channel',
					prompt: {
						start: 'What channel is the message you are trying to view the starinfo of in?',
						retry: 'Please give me a valid channel.'
					},
					optional: true,
					index: 1,
					type: 'textChannel',
					default: message => message.channel
				},
				{
					id: 'message',
					prompt: {
						start: 'What message would you like to view the starinfo of? (use its ID).',
						retry: (message, { channel }) => `Oops! I can't find that message in ${channel}. Remember to use its ID.`
					},
					index: 0,
					type: (word, message, { channel }) => {
						if (!word) return null;
						// eslint-disable-next-line prefer-promise-reject-errors
						return channel.fetchMessage(word).catch(() => Promise.reject());
					}
				}
			]
		});
	}

	exec(message, { message: msg }) {
		const starboard = this.client.starboards.get(message.guild.id);
		if (!starboard.channel) {
			return message.util.reply('There isn\'t a starboard channel to use.');
		}

		const star = starboard.stars.get(msg.id);
		if (!star) {
			return message.util.reply('That message has not been starred.');
		}

		const emoji = star.starredBy.length < 3
			? '⭐'
			: star.starredBy.length < 5
				? '🌟'
				: star.starredBy.length < 10
					? '✨'
					: '🌌';

		const embed = new MessageEmbed()
			.setColor(0xFFAC33)
			.addField('Author', msg.author, true)
			.addField('Channel', msg.channel, true)
			.addField('Starrers', star.starredBy.map(id => this.client.users.get(id)).join(', '))
			.setThumbnail(msg.author.displayAvatarURL({ size: 1024 }))
			.setTimestamp(msg.createdAt)
			.setFooter(`${emoji} ${star.starredBy.length} | ${msg.id}`);

		return message.util.send({ embed });
	}
}

module.exports = StarInfoCommand;
