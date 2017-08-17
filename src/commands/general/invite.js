const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class InviteCommand extends Command {
	constructor() {
		super('invite', {
			aliases: ['invite'],
			category: 'general',
			clientPermissions: ['EMBED_LINKS']
		});
	}

	async fetchInvite() {
		if (this.invite) return this.invite;
		const invite = await this.client.generateInvite([
			'READ_MESSAGES',
			'MANAGE_MESSAGES',
			'READ_MESSAGE_HISTORY',
			'SEND_MESSAGES',
			'EMBED_LINKS'
		]);

		this.invite = invite;
		return invite;
	}

	async exec(message) {
		const embed = new MessageEmbed()
			.setColor(0xFFAC33)
			.setDescription(`**[Add Hoshi to your server!](${await this.fetchInvite()})**`);

		return message.util.send({ embed });
	}
}

module.exports = InviteCommand;
