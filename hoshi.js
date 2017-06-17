const config = require('./config.json');
const HoshiClient = require('./src/struct/HoshiClient');
const Logger = require('./src/util/Logger');

const client = new HoshiClient(config);

client.on('ready', () => Logger.info(`${client.user.tag} is ready to serve!`))
	.on('disconnect', () => Logger.warn('Connection lost...'))
	.on('reconnect', () => Logger.info('Attempting to reconnect...'))
	.on('error', err => Logger.error(err))
	.on('warn', info => Logger.warn(info));

client.start();
