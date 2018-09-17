'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('notifications', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            target_user_id: {type: Sequelize.INTEGER, allowNull: false},
            from_user_id: {type: Sequelize.INTEGER, allowNull: false},
            description: Sequelize.STRING,
            type: Sequelize.STRING,
            createdAt: {type: Sequelize.DATE},
            updatedAt: {type: Sequelize.DATE}
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('notifications', {});
    }
};