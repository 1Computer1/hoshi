const { CommandUtil } = require('discord-akairo');
const { Message } = require('discord.js');

Object.defineProperty(CommandUtil.prototype, 'reply', {
	value: function reply(content, options) {
		return this.send(`${this.message.author} **::** ${content}`, options);
	}
});

Object.defineProperty(Message.prototype, 'reply', {
	value: function reply(content, options) {
		return this.channel.send(`${this.author} **::** ${content}`, options);
	}
});
