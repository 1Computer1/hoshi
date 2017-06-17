const Sequelize = require('sequelize');

const { dbURL } = require('../../config');
const Logger = require('../util/Logger');

const db = new Sequelize(dbURL, { logging: false });

function authenticate() {
	db.authenticate()
		.then(() => Logger.info('[POSTGRES]: Connection to database has been established successfully.'))
		.catch(error => {
			Logger.error('[POSTGRES]: Unable to connect to the database:');
			Logger.error(`[POSTGRES]: ${error}`);
			Logger.info('[POSTGRES]: Attempting to connect again in 5 seconds...');

			setTimeout(authenticate, 5000);
		});
}

authenticate();

module.exports = db;
