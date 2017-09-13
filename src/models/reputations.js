const Sequelize = require('sequelize');

const { db } = require('../struct/Database');

const Reputation = db.define('reputations', {
	sourceID: {
		type: Sequelize.STRING,
		allowNull: false
	},
	targetID: {
		type: Sequelize.STRING,
		allowNull: false
	},
	guildID: {
		type: Sequelize.STRING,
		allowNull: false
	},
	reason: {
		type: Sequelize.STRING,
		defaultValue: ''
	}
}, { paranoid: true });

module.exports = Reputation;
