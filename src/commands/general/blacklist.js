const { Command } = require('discord-akairo');

class BlacklistCommand extends Command {
	constructor() {
		super('blacklist', {
			aliases: ['blacklist'],
			category: 'general',
			channelRestriction: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'member',
					match: 'content',
					type: 'member',
					prompt: {
						start: msg => `${msg.author} **::** Which user do you want to blacklist?`,
						retry: msg => `${msg.author} **::** You did not supply a valid user. Please try again.`
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

			return message.util.send(`${member.user.tag} has been removed from the blacklist.`);
		} else {
			blacklist.push(member.id);
			await this.client.settings.set(message.guild, 'blacklist', blacklist);

			return message.util.send(`${member.user.tag} has been blacklisted from using the starboard and giving reputation on this server.`);
		}
	}
}

module.exports = BlacklistCommand;
