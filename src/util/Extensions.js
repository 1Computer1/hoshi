const { CommandUtil } = require('discord-akairo');

Object.defineProperty(CommandUtil.prototype, 'reply', {
	value: function reply(content, options) {
		return this.send(`${this.message.author} **::** ${content}`, options);
	}
});
