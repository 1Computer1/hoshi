require('./src/util/Extensions');

const HoshiClient = require('./src/struct/HoshiClient');
const Logger = require('./src/util/Logger');

const config = require('./config.json');
const client = new HoshiClient(config);
client.build();

client.commandHandler.on('commandStarted', (message, command) => {
	const tag = message.guild ? message.guild.name : `${message.author.tag}/PM`;
	Logger.log(`=> ${command.id}`, { tag });
});

client.on('disconnect', () => Logger.warn('Connection lost...'))
	.on('reconnect', () => Logger.info('Attempting to reconnect...'))
	.on('error', err => Logger.error(err))
	.on('warn', info => Logger.warn(info));

client.start();
