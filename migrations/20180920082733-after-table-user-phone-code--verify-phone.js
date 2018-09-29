'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return [
            queryInterface.addColumn('users', 'phone_code', {
                type: Sequelize.STRING,
            }),
            queryInterface.addColumn('users', 'verify_phone', {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            }),
        ];
    },

    down: (queryInterface) => {
        return [
            queryInterface.removeColumn('users', 'phone_code'),
            queryInterface.removeColumn('users', 'verify_phone'),
        ];
    }
};
