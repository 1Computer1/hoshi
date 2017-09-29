const { Listener } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

class GuildCreateListener extends Listener {
	constructor() {
		super('guildCreate', {
			event: 'guildCreate',
			emitter: 'client',
			category: 'client'
		});
	}

	exec(guild) {
		this.client.starboards.set(guild.id, new Starboard(guild));
	}
}

module.exports = GuildCreateListener;
