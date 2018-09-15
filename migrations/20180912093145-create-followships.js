'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('followships', {
            follower_id: Sequelize.INTEGER,
            followee_id: Sequelize.INTEGER
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('followships', {});
    }
};