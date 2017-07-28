const { Command } = require('discord-akairo');

class PrefixCommand extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'general',
			args: [
				{
					id: 'prefix',
					type: 'string',
					default: '*'
				}
			]
		});
	}

	async exec(message, { prefix }) {
		await this.client.settings.set(message.guild, 'prefix', prefix);
		if (prefix === '*') return message.reply('Prefix has be reset to `*`!');
		else return message.reply(`Prefix has be set to \`${prefix}\`!`);
	}
}

module.exports = PrefixCommand;
