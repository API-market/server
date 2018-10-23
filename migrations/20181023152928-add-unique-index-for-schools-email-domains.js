'use strict';

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.addIndex(`schools`, {
			fields: [`emailDomain`],
			unique: true,
		});
	},

	down: (queryInterface) => {
		return queryInterface.removeIndex(`schools`, `emailDomain`);
	}
};
