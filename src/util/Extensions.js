const { CommandUtil } = require('discord-akairo');
const { Message } = require('discord.js');

/* eslint-disable func-name-matching */

Object.defineProperty(CommandUtil.prototype, 'reply', {
	value: function reply(content, options) {
		return this.send(`${this.message.author} **::** ${Array.isArray(content) ? content.join('\n') : content}`, options);
	}
});

Object.defineProperty(Message.prototype, 'reply', {
	value: function reply(content, options) {
		return this.channel.send(`${this.author} **::** ${Array.isArray(content) ? content.join('\n') : content}`, options);
	}
});
