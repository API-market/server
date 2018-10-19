'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('polls', 'avatar', {
            type: Sequelize.STRING,
        });
    },

    down: (queryInterface, Sequelize) => {
        return Promise.resolve()
        // TODO temp fix for test
        // return queryInterface.removeColumn('polls', 'avatar');
    }
};
