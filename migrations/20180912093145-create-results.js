'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('results', {
            poll_id: Sequelize.INTEGER,
            answer: Sequelize.STRING,
            user_id: Sequelize.INTEGER
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('results', {});
    }
};