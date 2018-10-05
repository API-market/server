'use strict';

module.exports = {

	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn(
			{ tableName: 'community', schema: 'communities' },
			'deletedAt',
			{ type: Sequelize.DATE }
		);
	},

	down: (queryInterface) => {
		return queryInterface.removeColumn(
			{ tableName: 'community', schema: 'communities' },
			'deletedAt'
		);
	}

};
