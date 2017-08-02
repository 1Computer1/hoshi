const { Command } = require('discord-akairo');

class BlacklistCommand extends Command {
	constructor() {
		super('blacklist', {
			aliases: ['blacklist'],
			category: 'starboard',
			channelRestriction: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'user',
					prompt: {
						start: 'What user do you want to blacklist?',
						retry: 'You did not supply a valid user; Please try again.'
					},
					type: 'user'
				}
			]
		});
	}

	async exec(message, { user }) {
		const blacklist = this.client.settings.get(message.guild, 'blacklist', []);

		if (blacklist.includes(user.id)) {
			const index = blacklist.indexOf(user.id);
			blacklist.splice(index, 1);
			await this.client.settings.set(message.guild, 'blacklist', blacklist);

			return message.util.send(`${user.tag} has been removed from the blacklist.`);
		} else {
			blacklist.push(user.id);
			await this.client.settings.set(message.guild, 'blacklist', blacklist);

			// eslint-disable-next-line max-len
			return message.util.send(`${user.tag} has been blacklisted from using the starboard on this server.`);
		}
	}
}

module.exports = BlacklistCommand;
