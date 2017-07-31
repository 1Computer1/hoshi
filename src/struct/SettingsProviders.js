const { Guild } = require('discord.js');

class SettingsProvider {
	constructor(table) {
		this._table = table;
		this._settings = new Map();
	}

	async init() {
		const settings = await this._table.findAll();

		for (const setting of settings) {
			this._settings.set(setting.guildID, setting.settings);
		}
	}

	get(guild, key, defaultValue) {
		const guildID = this.constructor.getGuildID(guild);
		return this._settings.has(guildID) ? this._settings.get(guildID)[key] || defaultValue : defaultValue;
	}

	async set(guild, key, value) {
		const guildID = this.constructor.getGuildID(guild);
		const settings = this._settings.get(guildID) || {};
		settings[key] = value;

		this._settings.set(guildID, settings);

		await this._table.upsert({
			guildID,
			settings
		});
	}

	async delete(guild, key) {
		const guildID = this.constructor.getGuildID(guild);
		const settings = this._settings.get(guildID) || {};
		delete settings[key];

		await this._table.upsert({
			guildID,
			settings
		});
	}

	async clear(guild) {
		const guildID = this.constructor.getGuildID(guild);
		this._settings.delete(guildID);

		await this._table.destroy({ where: { guildID } });
	}

	static getGuildID(guild) {
		if (guild instanceof Guild) return guild.id;
		if (guild === 'global' || guild === null) return 'global';
		if (typeof guild === 'string' && !isNaN(guild)) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}

module.exports = SettingsProvider;
