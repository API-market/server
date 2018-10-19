'use strict';
const {migration} = require('lumeos_utils');
const db = require('lumeos_models');
const {community_count_polls, constants} = require('../migrations_views');

const schemaName = db.schemaNames.communities;
module.exports = {
	up: (queryInterface, Sequelize) => {
		return migration.createView(queryInterface, constants.communityCountPolls, community_count_polls(), {schema: schemaName});
	},

	down: (queryInterface) => {
		return migration.dropView(queryInterface, constants.communityCountPolls, '', {schema: schemaName})
	}
};
