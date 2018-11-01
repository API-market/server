'use strict';

module.exports = {

	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('user_emails', {

			id: {
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},

			userId: {type: Sequelize.INTEGER, allowNull: false},

			email: {type: Sequelize.STRING, allowNull: false, unique: true},
			domain: {type: Sequelize.STRING, allowNull: false},
			type: {type: Sequelize.STRING, allowNull: false},

			verify: {type: Sequelize.BOOLEAN, allowNull: false, default: false},
			verify_token: {type: Sequelize.STRING},

			createdAt: {type: Sequelize.DATE},
			updatedAt: {type: Sequelize.DATE},
			deletedAt: {type: Sequelize.DATE, allowNull: true},

		});
	},

	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('user_emails', {});
	}
};
