'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('images', {

			imageId: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},

			userId: {type: Sequelize.INTEGER, allowNull: false},

			entityType: {type: Sequelize.STRING, allowNull: true},
			entityId: {type: Sequelize.INTEGER, allowNull: true},

			imageUrl: {type: Sequelize.STRING, allowNull: true},
			originalImageUrl: {type: Sequelize.STRING, allowNull: true},
			key: {type: Sequelize.STRING, allowNull: true},

			createdAt: {type: Sequelize.DATE},
			updatedAt: {type: Sequelize.DATE},
			deletedAt: {type: Sequelize.DATE},

		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('images', {});
	}
};
