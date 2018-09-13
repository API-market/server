'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('transactions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            poll_id: Sequelize.INTEGER,
            user_id: Sequelize.INTEGER,
            amount: Sequelize.DOUBLE
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('transactions', {});
    }
};