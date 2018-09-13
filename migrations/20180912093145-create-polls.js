'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('polls', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            question: Sequelize.STRING,
            price: {type: Sequelize.DOUBLE, defaultValue: 0},
            participant_count: {type: Sequelize.INTEGER, defaultValue: 0},
            avatar: {
                type: Sequelize.STRING,
            },
            answers: {
                type: Sequelize.STRING,
            },
            tags: {
                type: Sequelize.STRING,
            },
            creator_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('polls', {});
    }
};