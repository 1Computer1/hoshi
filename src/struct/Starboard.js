class Starboard {
	constructor(guild) {
		this.client = guild.client;
		this.guild = guild;
	}

	get channel() {
		return this.client.settings.get('starboardChannelID');
	}
}

module.exports = Starboard;
