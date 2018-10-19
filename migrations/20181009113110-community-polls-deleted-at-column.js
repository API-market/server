'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn(
			{tableName: 'polls', schema: 'communities'},
			'deletedAt',
			{type: Sequelize.DATE}
		);
	},

	down: (queryInterface) => {
		return queryInterface.removeColumn(
			{tableName: 'polls', schema: 'communities'},
			'deletedAt'
		);
	}
};
