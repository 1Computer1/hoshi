const { Command } = require('discord-akairo');

class AboutCommand extends Command {
	constructor() {
		super('about', {
			aliases: ['about', 'info'],
			category: 'general',
			clientPermissions: ['EMBED_LINKS']
		});
	}

	exec(message) {
		const prefix = this.handler.prefix(message);
		const comp = this.client.users.get('123992700587343872');
		const grey = this.client.users.get('86890631690977280');

		const embed = this.client.util.embed()
			.setColor(0xFFAC33)
			.setTitle('About Hoshi')
			.setDescription([
				`Hoshi is developed by **${comp.tag}** and **${grey.tag}**.`,
				'',
				// eslint-disable-next-line max-len
				'Hoshi uses the **[Discord.js](https://discord.js.org)** library and the **[Akairo](https://1computer1.github.io/discord-akairo)** framework.',
				'You can find the Github repo for Hoshi **[here](https://github.com/1Computer1/hoshi)**.',
				'',
				`Use \`${prefix}stats\` for statistics and \`${prefix}invite\` for an invite link.`
			]);

		return message.util.send({ embed });
	}
}

module.exports = AboutCommand;
