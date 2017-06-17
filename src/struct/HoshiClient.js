const { AkairoClient } = require('discord-akairo');

class HoshiClient extends AkairoClient {
	constructor(config) {
		super({
			prefix: '*',
			allowMention: true,
			handleEdits: true,
			ownerID: config.owner,
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
