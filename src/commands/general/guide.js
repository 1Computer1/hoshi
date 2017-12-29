const { Command } = require('discord-akairo');

class GuideCommand extends Command {
	constructor() {
		super('guide', {
			aliases: ['guide'],
			category: 'general',
			clientPermissions: ['EMBED_LINKS'],
			description: { content: 'Shows information about how to use Hoshi.' }
		});
	}

	async exec(message) {
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
				`To set a threshold for a star to be able to show up on the starboard, use \`${prefix}starThreshold <number>\`.`,
				'',
				`Those with \`Manage Messages\` can use \`${prefix}deletestar <messageID>\` to delete stars.`,
				`To fix missing or incorrect stars on a message, use the \`${prefix}fixstar <messageID>\` command.`,
				'This command requires the `Manage Messages` permission to be usable.',
				'',
				`View those who starred a message with \`${prefix}starinfo <messageID>\`.`,
				`View the star count for a user with \`${prefix}showstars [user]\`.`,
				`View the leaderboards for stars with \`${prefix}topstars [page]\`.`,
				`View the best star in the server with \`${prefix}beststar\``
			])
			.addField('Reputation', [
				`You can add positive reputation to users with the \`${prefix}addrep <user>\` command.`,
				'You can specify a reason for the rep or replace the previous reason.',
				`Use \`${prefix}removerep <user>\` to remove reputation from the user`,
				'',
				`Those with \`Manage Messages\` can use \`${prefix}deleterep <source> <target>\` to delete reps.`,
				'The source user is the one who gave the rep and the target user is the one who received it.',
				'',
				`View the reputation count for a user with \`${prefix}showreps [user]\`.`,
				`View the leaderboards for reputations with \`${prefix}topreps [page]\`.`
			])
			.addField('Other', [
				`Use the \`${prefix}blacklist <user>\` to disallow someone from using the starboard or reputation commands.`,
				'This command requires the `Manage Guild` permission to be usable.',
				'You can use it again on the same user to remove them from the blacklist.',
				'',
				`To reset stars or reputation, use the \`${prefix}reset <star/rep/all>\` command.`,
				'This command requires the `Manage Guild` permission to be usable.',
				'',
				`Use the \`${prefix}prefix <prefix>\` command to change prefix.`,
				'This command requires the `Manage Guild` permission to be usable.',
				'You can also mention the bot to use commands.',
				'',
				`For more information about Hoshi, check out \`${prefix}about\` and \`${prefix}stats\`.`,
				`Invite Hoshi to your server with \`${prefix}invite\`.`
			]);

		const shouldReply = message.guild && message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES');

		try {
			await message.author.send({ embed });
			if (shouldReply) message.util.reply('I\'ve sent you a DM with the guide.');
		} catch (err) {
			if (shouldReply) message.util.reply('I could not send you the guide in DMs.');
		}
	}
}

module.exports = GuideCommand;
