'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('profile_images', {
            user_id: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            image: {
                type: Sequelize.STRING,
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('profile_images', {});
    }
};