'use strict';
const {migration} = require('lumeos_utils');
const db = require('lumeos_models');
const {community_count_polls, constansts} = require('../migrations_views');

const schemaName = db.schemaNames.communities;
module.exports = {
	up: (queryInterface, Sequelize) => {
		return migration.createView(queryInterface, constansts.communityCountPolls, community_count_polls(), {schema: schemaName});
	},

	down: (queryInterface) => {
		return migration.dropView(queryInterface, constansts.communityCountPolls, null, {schema: schemaName})
	}
};
