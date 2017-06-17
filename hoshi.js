const HoshiClient = require('./src/struct/HoshiClient');
const config = require('./config.json');

const client = new HoshiClient(config);
client.start();
