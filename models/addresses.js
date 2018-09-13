'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('addresses', {
        street: DataTypes.STRING,
        city: DataTypes.STRING,
        region: DataTypes.STRING,
        postalCode: DataTypes.STRING,
    }, {});
    Address.associate = function (models) {

    };
    return Address;
};