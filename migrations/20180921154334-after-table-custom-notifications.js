'use strict';

const tableName = 'custom_notifications';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn(tableName, 'usersId', {
          type: Sequelize.TEXT
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn(tableName, 'usersId', {
            type: Sequelize.STRING
        });
    }
};
