const { Command } = require('discord-akairo');

class ChannelBlacklistCommand extends Command {
	constructor() {
		super('channel-blacklist', {
			aliases: ['channel-blacklist', 'blacklist-channel', 'channel-unblacklist', 'unblacklist-channel'],
			category: 'general',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'channel',
					match: 'content',
					type: 'channel',
					prompt: {
						start: 'Which channel do you want to blacklist or unblacklist?',
						retry: 'Please provide a valid channel.'
					}
				}
			],
			description: {
				content: 'Blacklists or unblacklists a channel so that no messages there can be starred.',
				usage: '<channel>',
				examples: ['#some-channel']
			}
		});
	}

	async exec(message, { channel }) {
		const blacklist = this.client.settings.get(message.guild, 'channel-blacklist', []);

		if (blacklist.includes(channel.id)) {
			const index = blacklist.indexOf(channel.id);
			blacklist.splice(index, 1);
			await this.client.settings.set(message.guild, 'channel-blacklist', blacklist);

			return message.util.send(`**${channel.name}** has been removed from the blacklist.`);
		}

		blacklist.push(channel.id);
		await this.client.settings.set(message.guild, 'channel-blacklist', blacklist);

		return message.util.send(`**${channel.name}** has been blacklisted. No more messages can be starred there.`);
	}
}

module.exports = ChannelBlacklistCommand;
