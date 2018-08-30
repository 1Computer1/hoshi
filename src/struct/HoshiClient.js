const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const { Collection } = require('discord.js');
const Database = require('./Database');
const path = require('path');
const SettingsProvider = require('./SettingsProviders');
const Setting = require('../models/settings');

class HoshiClient extends AkairoClient {
	constructor(config) {
		super({ ownerID: config.owner }, {
			disableEveryone: true,
			disabledEvents: ['TYPING_START']
		});

		this.commandHandler = new CommandHandler(this, {
			directory: path.join(__dirname, '..', 'commands'),
			aliasReplacement: /-/g,
			prefix: message => this.settings.get(message.guild, 'prefix', '*'),
			allowMention: true,
			fetchMembers: true,
			commandUtil: true,
			commandUtilLifetime: 3e5,
			handleEdits: true,
			defaultCooldown: 2500,
			defaultPrompt: {
				modifyStart: (text, msg) => text && `${msg.author} **::** ${text}\nType \`cancel\` to cancel this command.`,
				modifyRetry: (text, msg) => text && `${msg.author} **::** ${text}\nType \`cancel\` to cancel this command.`,
				timeout: msg => `${msg.author} **::** Time ran out, command has been cancelled.`,
				ended: msg => `${msg.author} **::** Too many retries, command has been cancelled.`,
				cancel: msg => `${msg.author} **::** Command has been cancelled.`,
				retries: 4,
				time: 30000
			}
		});

		this.inhibitorHandler = new InhibitorHandler(this, { directory: path.join(__dirname, '..', 'inhibitors') });
		this.listenerHandler = new ListenerHandler(this, { directory: path.join(__dirname, '..', 'listeners') });

		this.config = config;
		this.settings = new SettingsProvider(Setting);
		this.starboards = new Collection();

		this.setup();
	}

	setup() {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler
		});

		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();
	}

	async start() {
		await Database.authenticate();
		await this.settings.init();
		return this.login(this.config.token);
	}
}

module.exports = HoshiClient;
