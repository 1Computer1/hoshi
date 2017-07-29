const { AkairoClient } = require('discord-akairo');
const { Collection } = require('discord.js');

const Database = require('./Database');
const SettingsProvider = require('./SettingsProviders');
const Setting = require('../models/settings');
const Starboard = require('./Starboard');

class HoshiClient extends AkairoClient {
	constructor(config) {
		super({
			prefix: message => this.settings.get(message.guild, 'prefix', '*'),
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
		this.settings = new SettingsProvider(Setting);
		this.starboards = new Collection();
	}

	async start() {
		await Database.authenticate();
		await this.settings.init();
		await this.login(this.config.token);
		for (const guild of this.guilds.values()) {
			this.starboards.set(guild.id, new Starboard(guild));
		}
	}
}

module.exports = HoshiClient;
