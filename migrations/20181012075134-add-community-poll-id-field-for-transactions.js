'use strict';

module.exports = {

	up: (queryInterface, Sequelize) => {
		return queryInterface.addColumn(
			{ tableName: 'transactions' },
			'community_poll_id',
			{ type: Sequelize.INTEGER }
		);
	},

	down: (queryInterface) => {
		return queryInterface.removeColumn(
			{ tableName: 'transactions' },
			'community_poll_id'
		);
	},

};
