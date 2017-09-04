const { Listener } = require('discord-akairo');
const Logger = require('../../util/Logger');
const Starboard = require('../../struct/Starboard');

class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			event: 'ready',
			emitter: 'client',
			category: 'client'
		});
	}

	exec() {
		Logger.info(`${this.client.user.tag} is ready to serve!`);
		this.client.user.setActivity('@Hoshi help');

		for (const guild of this.client.guilds.values()) {
			const starboard = new Starboard(guild);
			this.client.starboards.set(guild.id, starboard);

			const starboardChannelID = this.client.settings.get(guild, 'starboardChannelID');
			if (starboardChannelID && !starboard.channel) {
				this.client.settings.delete(guild, 'starboardChannelID');
				this.client.starboards.get(guild.id).destroy();
			}
		}
	}
}

module.exports = ReadyListener;
