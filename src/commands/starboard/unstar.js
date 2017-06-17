const { Command } = require('discord-akairo');
const Logger = require('../../util/Logger');

class UnstarCommand extends Command {
	constructor() {
		super('unstar', {
			aliases: ['unstar'],
			category: 'starboard',
			channelRestriction: 'guild',
			args: [
				// Indices are swapped in order to process channel first.
				{
					id: 'channel',
					index: 1,
					type: 'textChannel',
					default: message => message.channel
				},
				{
					id: 'message',
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

	exec(message, { channel, message: msg }) {
		// Temporary, implement unstarring later.
		Logger.log(`${channel.name}: ${msg.content}`);
	}
}

module.exports = UnstarCommand;
