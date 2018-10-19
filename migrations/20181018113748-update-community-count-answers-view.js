'use strict';
const {migration} = require('lumeos_utils');
const db = require('lumeos_models');
const {community_count_answers_updated, community_count_answers} = require('../migrations_views');

const schemaName = db.schemaNames.communities;
module.exports = {
    up: (queryInterface, Sequelize) => {
        return migration.dropView(queryInterface, `community_count_answers`, community_count_answers_updated(), {schema: schemaName}).then(() => {
            return migration.createView(queryInterface, `community_count_answers`, community_count_answers_updated(), {schema: schemaName});
        });
    },

    down: (queryInterface) => {
        return migration.createView(queryInterface, `community_count_answers`, community_count_answers(), {schema: schemaName});
    }
};
