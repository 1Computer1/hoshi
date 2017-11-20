require('./src/util/Extensions');

const Raven = require('raven');

const HoshiClient = require('./src/struct/HoshiClient');
const Logger = require('./src/util/Logger');

const config = require('./config.json');
const client = new HoshiClient(config).build();

if (config.sentryKey) {
	Raven.config(config.sentryKey).install();
}

client.on('disconnect', () => Logger.warn('Connection lost...'))
	.on('reconnect', () => Logger.info('Attempting to reconnect...'))
	.on('error', err => Logger.error(err))
	.on('warn', info => Logger.warn(info));

client.start();

process.on('unhandledRejection', err => {
	Logger.error('An unhandled promise rejection occured');
	Logger.stacktrace(err);
});
