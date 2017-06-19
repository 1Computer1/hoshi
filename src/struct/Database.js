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
			Logger.info('Connection to database has been established successfully.', { tag: 'POSTGRES' });
		} catch (err) {
			Logger.error('Unable to connect to the database:', { tag: 'POSTGRES' });
			Logger.stacktrace(err, { tag: 'POSTGRES' });
			Logger.info('Attempting to connect again in 5 seconds...', { tag: 'POSTGRES' });
			setTimeout(this.authenticate, 5000);
		}
	}
}

module.exports = Database;
