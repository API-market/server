'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Tokens = sequelize.define('tokens', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        name: {type: DataTypes.STRING},
        token: {type: DataTypes.STRING, unique: true},
        platform: {type: DataTypes.STRING},
        active: {type: DataTypes.BOOLEAN, defaultValue: true},
    }, {});
    Tokens.associate = function (models) {
        // this.belongsTo(models.Polls, {foreignKey: 'user_id'});
    };
    return Tokens;
};