'use strict';

const schemaName = 'communities';
module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.addConstraint(`${schemaName}.community_users`, ['community_id', 'user_id'], {
            type: 'unique',
            name: 'community_users_community_id_user_id_unique'
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeConstraint(`${schemaName}.community_users`, 'community_users_community_id_user_id_unique');
    }
};
