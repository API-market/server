'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('polls', 'avatar', {
            type: Sequelize.STRING,
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.describeTable('polls')
            .then(tableDefinition => {
                if (tableDefinition) return queryInterface.removeColumn('polls', 'avatar');

                return Promise.resolve();
            });
    }
};
