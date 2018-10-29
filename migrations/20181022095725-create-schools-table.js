'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('schools', {

			schoolId: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER
			},

			name: {type: Sequelize.STRING, allowNull: false},
			emailDomain: {type: Sequelize.STRING, allowNull: true},
			countryId: {type: Sequelize.INTEGER, allowNull: true},
			createdAt: {type: Sequelize.DATE},
			updatedAt: {type: Sequelize.DATE},

		});
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.dropTable('schools', {});
	}
};
