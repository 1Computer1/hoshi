const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'halp', 'guide'],
			category: 'general'
		});
	}

	exec(message) {
		const prefix = this.handler.prefix(message);

		const embed = new MessageEmbed()
			.setColor(0xFFAC33)
			.setTitle('Guide to Hoshi')
			.addField('Setup', [
				'Hoshi requires the following permissions to be usable:',
				'- `Read Messages`',
				'- `Manage Messages`',
				'- `Read Message History`',
				'- `Send Messages`',
				'- `Embed Links`',
				'',
				'To setup the starboard, create a channel for it.',
				`Then, use the \`${prefix}starboard <channel>\` command to set it to that channel.`,
				'This command requires the `Manage Guild` permission to be usable.',
				'You can now star messages and they will be sent to that channel.'
			])
			.addField('Starring', [
				'There are two ways to star and unstar a message.',
				'The easiest way is to add or remove ⭐ reactions to the message.',
				'Note that messages sent before the Hoshi went online will not work with reactions.',
				`You can also use the commands \`${prefix}star <messageID>\` and \`${prefix}unstar <messageID>\`.`,
				'',
				`Use the \`${prefix}star-info <messageID>\` to view who has starred a message.`,
				`Those with \`Manage Messages\` can use \`${prefix}delete <messageID>\` to delete stars.`,
				'Deleting or changing the starboard channel itself will reset all stars.'
			])
			.addField('Other', [
				`Use the \`${prefix}prefix <prefix>\` command to change prefix.`,
				'This command requires the `Manage Guild` permission to be usable.',
				'You can also mention the bot to use commands.'
			]);

		return message.util.send({ embed });
	}
}

module.exports = HelpCommand;
