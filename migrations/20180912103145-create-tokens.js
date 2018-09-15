'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('tokens', {
            user_id: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            name: {type: Sequelize.STRING},
            token: {type: Sequelize.STRING, unique: true},
            platform: {type: Sequelize.STRING},
            active: {type: Sequelize.BOOLEAN, defaultValue: true},
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('tokens', {});
    }
};