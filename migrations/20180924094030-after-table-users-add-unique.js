'use strict';
const {model} = require('lumeos_utils');
const {User} = require('../db_entities');

const tableName = 'public.users';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return User.update({phone: null, phone_code: null}, {
            where: {}
        }).then(() => {
            return model.multipleUniqueMigration(queryInterface, {tableName, fields: ['phone', 'phone_code']});
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeConstraint(tableName, 'users_phone_phone_code_key');
    }
};
