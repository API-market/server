'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.addColumn('users', 'verify_token', {
                type: Sequelize.STRING(150),
            }),
            queryInterface.addColumn('users', 'verify', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }),
        ])
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.removeColumn('users', 'verify_token'),
            queryInterface.removeColumn('users', 'verify'),
        ])
    }
};
