'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('users', 'count_notifications', {
            type: Sequelize.INTEGER,
            defaultValue: 0
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('users', 'count_notifications');
    }
};
