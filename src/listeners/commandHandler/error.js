const { Listener } = require('discord-akairo');

class ErrorListener extends Listener {
	constructor() {
		super('error', {
			eventName: 'error',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	exec(err, message) {
		const owners = this.client.ownerID.map(id => this.client.users.get(id).tag);
		return message.channel.send([
			`An error occured, please contact ${owners.join(' or ')}.`,
			'```js',
			err.toString(),
			'```'
		]);
	}
}

module.exports = ErrorListener;
