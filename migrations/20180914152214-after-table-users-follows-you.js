'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('users', 'follows_you_notifications', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('users', 'follows_you_notifications');
    }
};
