'use strict';
const tableName = 'tokens';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable(tableName, {
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'cascade'
            },
            name: {type: Sequelize.STRING},
            token: {
                type: Sequelize.STRING(511),
                allowNull: false
            },
            platform: {type: Sequelize.STRING},
            active: {type: Sequelize.BOOLEAN, defaultValue: true},
            createdAt: {type: Sequelize.DATE},
            updatedAt: {type: Sequelize.DATE}
        }).then(() => {
            return queryInterface.sequelize.query(`ALTER TABLE ${tableName} ADD UNIQUE (token, user_id)`);
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable(tableName, {});
    }
};