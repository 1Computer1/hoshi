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
		if (!prefix) message.util.send('Please provide a prefix!');
		await this.client.settings.set(message.guild, 'prefix', prefix);
		if (prefix === '*') return message.util.send('Prefix has be reset to `*`!');
		return message.util.send(`Prefix has be set to \`${prefix}\`!`);
	}
}

module.exports = PrefixCommand;
