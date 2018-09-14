'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('users', 'not_answers_notifications', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('users', 'not_answers_notifications');
    }
};
