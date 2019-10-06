const { Command } = require('discord-akairo');
const Starboard = require('../../struct/Starboard');

class SettingsCommand extends Command {
	constructor() {
		super('settings', {
			aliases: ['settings', 'view-settings'],
			category: 'general',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			description: { content: 'Displays the guild\'s current settings.' }
		});
	}

	exec(message) {
		const prefix = this.handler.prefix(message);
		const emojiID = this.client.settings.get(message.guild, 'emoji', '⭐');
		const starboard = this.client.starboards.get(message.guild.id);
		const blacklist = this.client.settings.get(message.guild, 'blacklist', []).map(id => `<@${id}>`);
		const channelBlacklist = this.client.settings.get(message.guild, 'channel-blacklist', []).map(id => `<#${id}>`);

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setTitle('Settings')
			.setDescription([
				`**Prefix**: ${prefix}`,
				`**Emoji**: ${Starboard.emojiFromID(this.client, emojiID)}`,
				`**Starboard**: ${(starboard && starboard.channel) || 'None'}`,
				`**Threshold**: ${(starboard && starboard.threshold) || 'None'}`,
				`**Blacklist**: ${blacklist.join(', ') || 'None'}`,
				`**Channel Blacklist**: ${channelBlacklist.join(', ') || 'None'}`
			]);

		return message.util.send({ embed });
	}
}

module.exports = SettingsCommand;
