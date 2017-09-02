const { Command } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

class StarInfoCommand extends Command {
	constructor() {
		super('starInfo', {
			aliases: ['starInfo', 'star-info'],
			category: 'starboard',
			channelRestriction: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				// Indices are swapped in order to process channel first.
				{
					id: 'channel',
					index: 1,
					match: 'rest',
					type: 'textChannel',
					default: message => message.channel,
					prompt: {
						start: msg => `${msg.author} **::** That channel could not be found. What channel is the message you are trying to view the info of in?`,
						retry: msg => `${msg.author} **::** Please provide a valid text channel.`,
						optional: true
					}
				},
				{
					id: 'message',
					index: 0,
					type: (word, message, { channel }) => {
						if (!word) return null;
						// eslint-disable-next-line prefer-promise-reject-errors
						return channel.fetchMessage(word).catch(() => Promise.reject());
					},
					prompt: {
						start: 'What is the ID of the message you would like to view the info of?',
						retry: (message, { channel }) => `Oops! I can't find that message in ${channel}. Remember to use its ID.`
					}
				}
			]
		});
	}

	async exec(message, { message: msg }) {
		const starboard = this.client.starboards.get(message.guild.id);
		if (!starboard.channel) {
			return message.util.reply('There isn\'t a starboard channel to use.');
		}

		const star = starboard.stars.get(msg.id);
		if (!star) {
			return message.util.reply('That message has not been starred.');
		}

		const emoji = Starboard.getStarEmoji(star.starredBy.length);

		const starredBy = [];
		const promises = [];
		for (const id of star.starredBy) {
			promises.push(this.client.fetchUser(id).then(user => {
				starredBy.push(user);
			}));
		}

		await Promise.all(promises);

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.addField('Author', msg.author, true)
			.addField('Channel', msg.channel, true)
			.addField('Starrers', starredBy.join(', '))
			.setThumbnail(msg.author.displayAvatarURL)
			.setTimestamp(msg.createdAt)
			.setFooter(`${emoji} ${star.starredBy.length} | ${msg.id}`);

		return message.util.send({ embed });
	}
}

module.exports = StarInfoCommand;
