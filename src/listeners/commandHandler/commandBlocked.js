const { Listener } = require('discord-akairo');
const Logger = require('../../util/Logger');

class CommandBlockedListener extends Listener {
	constructor() {
		super('commandBlocked', {
			event: 'commandBlocked',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	exec(message, command, reason) {
		const text = {
			owner: () => 'You must be the owner to use this command.',
			guild: () => 'You must be in a guild to use this command.',
			clientPermissions: () => {
				const str = this.missingPermissions(message.channel, this.client.user, command.clientPermissions);
				return `I'm missing ${str} to run that command in this channel.`;
			},
			userPermissions: () => {
				const str = this.missingPermissions(message.channel, message.author, command.userPermissions);
				return `You are missing ${str} to use that command in this channel.`;
			}
		}[reason];

		const tag = message.guild ? message.guild.name : `${message.author.tag}/PM`;
		Logger.log(`=> ${command.id} ~ ${reason}`, { tag });

		if (!text) return;
		message.reply(text());
	}

	missingPermissions(channel, user, permissions) {
		const missingPerms = channel.permissionsFor(user).missing(permissions)
			.map(str => `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``);

		return missingPerms.length > 1
			? `${missingPerms.slice(0, -1).join(', ')} and ${missingPerms.slice(-1)[0]}`
			: missingPerms[0];
	}
}

module.exports = CommandBlockedListener;
