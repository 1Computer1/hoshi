const { db } = require('../struct/Database');
const Sequelize = require('sequelize');

const Star = db.define('stars', {
	messageID: {
		type: Sequelize.STRING,
		primaryKey: true,
		allowNull: false
	},
	authorID: {
		type: Sequelize.STRING,
		allowNull: false
	},
	channelID: {
		type: Sequelize.STRING,
		allowNull: false
	},
	guildID: {
		type: Sequelize.STRING,
		allowNull: false
	},
	starboardMessageID: {
		type: Sequelize.STRING,
		allowNull: true
	},
	starCount: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	starredBy: {
		type: Sequelize.ARRAY(Sequelize.STRING), // eslint-disable-line new-cap
		allowNull: false
	}
});

module.exports = Star;
