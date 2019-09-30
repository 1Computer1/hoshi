const { dbURL } = require('../../config.json');
const Logger = require('../util/Logger');
const path = require('path');
const readdir = require('util').promisify(require('fs').readdir);
const Sequelize = require('sequelize');

const db = new Sequelize(dbURL, { logging: false });

class Database {
	static get db() {
		return db;
	}

	static async authenticate() {
		try {
			await db.authenticate();
			Logger.info('Connection to database has been established successfully.', { tag: 'Postgres' });
			await this.loadModels(path.join(__dirname, '..', 'models'));
		} catch (err) {
			Logger.error('Unable to connect to the database:', { tag: 'Postgres' });
			Logger.stacktrace(err, { tag: 'Postgres' });
			Logger.info('Attempting to connect again in 5 seconds...', { tag: 'Postgres' });
			setTimeout(this.authenticate, 5000);
		}
	}

	static async loadModels(modelsPath) {
		const files = await readdir(modelsPath);

		for (const file of files) {
			const filePath = path.join(modelsPath, file);
			if (!filePath.endsWith('.js')) continue;
			await require(filePath).sync(); // eslint-disable-line no-await-in-loop
		}
	}
}

module.exports = Database;
