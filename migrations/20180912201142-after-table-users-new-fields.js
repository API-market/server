'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {

        return Promise.all([
            queryInterface.addColumn('users', 'all_notifications', {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            }),
            queryInterface.addColumn('users', 'tag_line', {
                type: Sequelize.STRING,
            }),
            queryInterface.addColumn('users', 'forgot_token', {
                type: Sequelize.STRING,
            })
        ]);
    },

    down: (queryInterface) => {
        return Promise.all([
            queryInterface.removeColumn('users', 'all_notifications'),
            queryInterface.removeColumn('users', 'tag_line'),
            queryInterface.removeColumn('users', 'forgot_token'),
        ])
    }
};
