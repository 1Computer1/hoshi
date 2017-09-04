const { Command } = require('discord-akairo');

class PrefixCommand extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'general',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'prefix',
					type: word => {
						if (!word) return null;
						if (/\s/.test(word) || word.length > 10) return null;
						return word;
					},
					prompt: {
						start: msg => `${msg.author} **::** What would you like to set the prefix to?`,
						retry: msg => `${msg.author} **::** Please provide a prefix without spaces and less than 10 characters.`
					}
				}
			]
		});
	}

	async exec(message, { prefix }) {
		await this.client.settings.set(message.guild, 'prefix', prefix);
		if (prefix === '*') return message.util.send('Prefix has been reset to `*`');
		return message.util.reply(`Prefix has been set to \`${prefix}\``);
	}
}

module.exports = PrefixCommand;
