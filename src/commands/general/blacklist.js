const { Command } = require('discord-akairo');

class BlacklistCommand extends Command {
	constructor() {
		super('blacklist', {
			aliases: ['blacklist', 'unblacklist'],
			category: 'general',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'member',
					match: 'content',
					type: 'member',
					prompt: {
						start: 'Which user do you want to blacklist or unblacklist?',
						retry: 'Please provide a valid user.'
					}
				}
			]
		});
	}

	async exec(message, { member }) {
		const blacklist = this.client.settings.get(message.guild, 'blacklist', []);

		if (blacklist.includes(member.id)) {
			const index = blacklist.indexOf(member.id);
			blacklist.splice(index, 1);
			await this.client.settings.set(message.guild, 'blacklist', blacklist);

			return message.util.send(`**${member.user.tag}** has been removed from the blacklist.`);
		} else {
			blacklist.push(member.id);
			await this.client.settings.set(message.guild, 'blacklist', blacklist);

			return message.util.send(`**${member.user.tag}** has been blacklisted from using the starboard and giving reputation on this server.`);
		}
	}
}

module.exports = BlacklistCommand;
