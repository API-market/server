'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('users', 'custom_notifications', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('users', 'custom_notifications');
    }
};
