const Logger = require('../util/Logger');
const Sequelize = require('sequelize');

const { dbURL } = require('../../config.json');
const db = new Sequelize(dbURL, { logging: false });

class Database {
	static get db() {
		return db;
	}

	static async authenticate() {
		try {
			await db.authenticate();
			Logger.info('[POSTGRES]: Connection to database has been established successfully.');
		} catch (err) {
			Logger.error('[POSTGRES]: Unable to connect to the database:');
			Logger.error(`[POSTGRES]: ${err}`);
			Logger.info('[POSTGRES]: Attempting to connect again in 5 seconds...');
			setTimeout(this.authenticate, 5000);
		}
	}
}

module.exports = Database;
