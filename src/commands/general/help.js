const { Command } = require('discord-akairo');

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'halp', 'h'],
			category: 'general',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'command',
					type: 'commandAlias',
					prompt: {
						start: 'Which command do you need help with?',
						retry: 'Please provide a valid command.',
						optional: true
					}
				}
			]
		});
	}

	exec(message, { command }) {
		if (!command) return this.execCommandList(message);

		const prefix = this.handler.prefix(message);
		const description = Object.assign({
			content: 'No description available.',
			usage: '',
			examples: [command.aliases[0]],
			fields: []
		}, command.description);

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setTitle(`\`${prefix}${command.aliases[0]} ${description.usage}\``)
			.addField('Description', description.content);

		for (const field of description.fields) embed.addField(field.name, field.value);
		embed
			.addField('Examples', `\`${description.examples.join('`\n`')}\``)
			.addField('Aliases', `\`${command.aliases.join('` `')}\``);

		return message.util.send({ embed });
	}

	async execCommandList(message) {
		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.addField('Command List',
				[
					'This is a list of commands.',
					'To view details for a command, do `*help <command>`.',
					'To view the guide which explains how to use Hoshi in depth, use `*guide`.'
				]
			);

		for (const category of this.handler.categories.values()) {
			const title = {
				general: '📝\u2000General',
				reputation: '💕\u2000Reputation',
				starboard: '⭐\u2000Starboard'
			}[category.id];

			if (title) embed.addField(title, `\`${category.map(cmd => cmd.aliases[0]).join('` `')}\``);
		}

		const shouldReply = message.guild && message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES');

		try {
			await message.author.send({ embed });
			if (shouldReply) message.util.reply('I\'ve sent you a DM with the command list.');
		} catch (err) {
			if (shouldReply) message.util.reply('I could not send you the command list in DMs.');
		}
	}
}

module.exports = HelpCommand;
