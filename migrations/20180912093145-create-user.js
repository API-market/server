'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            eos: Sequelize.STRING,
            firstName: Sequelize.STRING,
            lastName: Sequelize.STRING,
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            phone: Sequelize.STRING,
            dob: Sequelize.STRING,
            gender: Sequelize.STRING,
            school: Sequelize.STRING,
            employer: Sequelize.STRING,
            balance: {type: Sequelize.DOUBLE, defaultValue: 500},
            followee_count: {type: Sequelize.INTEGER, defaultValue: 0},
            follower_count: {type: Sequelize.INTEGER, defaultValue: 0},
            answer_count: {type: Sequelize.INTEGER, defaultValue: 0},
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('users', {});
    }
};