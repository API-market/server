'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('polls', 'avatar', {
            type: Sequelize.STRING,
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('polls', 'avatar');
    }
};
