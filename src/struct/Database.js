const readDir = require('util').promisify(require('fs').readdir);
const path = require('path');
const Sequelize = require('sequelize');

const { dbURL } = require('../../config.json');
const Logger = require('../util/Logger');

const db = new Sequelize(dbURL, { logging: false });

class Database {
	static get db() {
		return db;
	}

	static async authenticate() {
		try {
			await db.authenticate();
			Logger.info('Connection to database has been established successfully.', { tag: 'POSTGRES' });
			await Database.loadModels(path.join(__dirname, '..', 'models'));
		} catch (err) {
			Logger.error('Unable to connect to the database:', { tag: 'POSTGRES' });
			Logger.stacktrace(err, { tag: 'POSTGRES' });
			Logger.info('Attempting to connect again in 5 seconds...', { tag: 'POSTGRES' });
			setTimeout(this.authenticate, 5000);
		}
	}

	static async loadModels(modelsPath) {
		const files = await readDir(modelsPath);

		for (const file of files) {
			const filePath = path.join(modelsPath, file);
			if (!filePath.endsWith('.js')) continue;
			await require(filePath).sync(); // eslint-disable-line no-await-in-loop
		}
	}
}

module.exports = Database;
