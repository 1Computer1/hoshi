const { Listener } = require('discord-akairo');

class GuildDeleteListener extends Listener {
	constructor() {
		super('guildDelete', {
			eventName: 'guildDelete',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec(guild) {
		await this.client.starboards.get(guild.id).destroy();
		await this.client.settings.delete(guild);
		this.client.starboards.delete(guild.id);
	}
}

module.exports = GuildDeleteListener;
