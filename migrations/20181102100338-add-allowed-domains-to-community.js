'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn(
			{tableName: 'community', schema: 'communities'},
			'allowedDomains',
			{type: Sequelize.STRING}
		);
	},

	down: (queryInterface) => {
		return queryInterface.removeColumn(
			{tableName: 'community', schema: 'communities'},
			'allowedDomains'
		);
	}
};
