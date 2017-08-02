const path = require('path');
const { AkairoClient } = require('discord-akairo');
const { Collection } = require('discord.js');

const Database = require('./Database');
const SettingsProvider = require('./SettingsProviders');
const Setting = require('../models/settings');

class HoshiClient extends AkairoClient {
	constructor(config) {
		super({
			prefix: message => this.settings.get(message.guild, 'prefix', '*'),
			allowMention: true,
			handleEdits: true,
			ownerID: config.owner,
			commandDirectory: path.join(__dirname, '..', 'commands'),
			listenerDirectory: path.join(__dirname, '..', 'listeners'),
			defaultPrompt: {
				timeout: msg => `${msg.author} **::** Time ran out, command has been cancelled.`,
				ended: msg => `${msg.author} **::** Too many retries, command has been cancelled.`,
				cancel: msg => `${msg.author} **::** Command has been cancelled.`,
				retries: 4,
				time: 30000
			}
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
		return this.login(this.config.token);
	}
}

module.exports = HoshiClient;
