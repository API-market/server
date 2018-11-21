'use strict';

const db = require('lumeos_models');

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('transactions', {
            created_at: {
                type: Sequelize.DATE,
            },
            updated_at: {
                type: Sequelize.DATE,
            },
            community_poll_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
            },
        }, {
            schema: db.schemaNames.communities
        });
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('transactions', {schema: db.schemaNames.communities});
    },

};
