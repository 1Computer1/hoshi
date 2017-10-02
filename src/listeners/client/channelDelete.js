const { Listener } = require('discord-akairo');

class ChannelDeleteListener extends Listener {
	constructor() {
		super('channelDelete', {
			event: 'channelDelete',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec(channel) {
		if (!channel.guild) return;
		const starboardChannelID = this.client.settings.get(channel.guild, 'starboardChannelID');
		if (!starboardChannelID) return;
		if (starboardChannelID === channel.id) {
			await this.client.settings.delete(channel.guild, 'starboardChannelID');
		}
	}
}

module.exports = ChannelDeleteListener;
