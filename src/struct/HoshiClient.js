const { AkairoClient } = require('discord-akairo');

class HoshiClient extends AkairoClient {
	constructor(config) {
		super({
			allowMention: true,
			ownerID: config.owner,
			prefix: '*',
			commandDirectory: './src/commands',
			listenerDirectory: './src/listeners'
		}, {
			disableEveryone: true,
			disabledEvents: ['TYPING_START']
		});

		this.config = config;
	}

	start() {
		return this.login(this.config.token);
	}
}

module.exports = HoshiClient;
