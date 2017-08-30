const { Inhibitor } = require('discord-akairo');

class SendMessagesInhibitor extends Inhibitor {
	constructor() {
		super('sendMessages', { reason: 'sendMessages' });
	}

	exec(message, command) {
		if (!message.guild) return false;
		if (command.id === 'help') return false;
		return !message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES');
	}
}

module.exports = SendMessagesInhibitor;
