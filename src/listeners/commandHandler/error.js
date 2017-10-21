const { Listener } = require('discord-akairo');
const Logger = require('../../util/Logger');

class ErrorListener extends Listener {
	constructor() {
		super('error', {
			event: 'error',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	exec(err, message) {
		Logger.error('An error occured in a command.');

		const tag = message.guild ? message.guild.name : `${message.author.tag}/PM`;
		Logger.error(message.content, { tag });
		Logger.stacktrace(err);

		if (message.guild ? message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES') : true) {
			const owners = this.client.ownerID.map(id => this.client.users.get(id).tag);
			message.channel.send([
				`An error occured, please contact ${owners.join(' or ')}.`,
				'```js',
				err.toString(),
				'```'
			]);
		}
	}
}

module.exports = ErrorListener;
