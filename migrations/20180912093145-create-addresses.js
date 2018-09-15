'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('addresses', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            street: Sequelize.STRING,
            city: Sequelize.STRING,
            region: Sequelize.STRING,
            postalCode: Sequelize.STRING,
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('addresses', {});
    }
};