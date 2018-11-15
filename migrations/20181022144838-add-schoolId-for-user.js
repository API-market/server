'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn(
			{tableName: 'users'},
			'schoolId',
			{type: Sequelize.INTEGER}
		);
	},

	down: (queryInterface) => {
		return queryInterface.removeColumn(
			{tableName: 'users'},
			'schoolId'
		);
	}
};
