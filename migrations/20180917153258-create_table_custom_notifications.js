'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('custom_notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: Sequelize.STRING,
            description: Sequelize.TEXT,
            active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            usersId: Sequelize.STRING,
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            }
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('custom_notifications', {});
    }
};
