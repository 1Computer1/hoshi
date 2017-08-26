const { Command } = require('discord-akairo');

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help', 'halp', 'guide'],
			category: 'general',
			clientPermissions: ['EMBED_LINKS']
		});
	}

	exec(message) {
		const prefix = this.handler.prefix(message);

		const embed = this.client.util.embed()
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
				`Those with \`Manage Messages\` can use \`${prefix}delete <messageID>\` to delete stars.`,
				'Deleting or changing the starboard channel itself will reset all stars.',
				'',
				`View those who starred a message with \`${prefix}starinfo <messageID>\`.`,
				`View the star count for a user with \`${prefix}showstars <user>\`.`,
				`View the leaderboards for stars with \`${prefix}topstars <user>\`.`
			])
			.addField('Reputation', [
				`You can add positive reputation to users with the \`${prefix}addrep <user>\` command.`,
				`You can specify a reason for the rep or replace the previous reason.`,
				`Use \`${prefix}removerep <user>\` to remove reputation from the user`,
				'',
				`View the reputation count for a user with \`${prefix}showreps <user>\`.`,
				`View the leaderboards for reputations with \`${prefix}topreps <user>\`.`
			])
			.addField('Other', [
				`Use the \`${prefix}prefix <prefix>\` command to change prefix.`,
				'This command requires the `Manage Guild` permission to be usable.',
				'You can also mention the bot to use commands.',
				'',
				`For more information about Hoshi, check out \`${prefix}about\` and \`${prefix}stats\`.`,
				`Invite Hoshi to your server with \`${prefix}invite\`.`
			]);

		return message.util.send({ embed });
	}
}

module.exports = HelpCommand;
