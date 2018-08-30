const { db } = require('../struct/Database');
const Sequelize = require('sequelize');

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
});

module.exports = Reputation;
