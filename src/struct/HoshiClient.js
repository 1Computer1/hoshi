const { AkairoClient } = require('discord-akairo');
const Logger = require('../util/Logger');

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

	async start() {
		await this.login(this.config.token);
		Logger.info('Hoshi has logged in.');
	}
}

module.exports = HoshiClient;
