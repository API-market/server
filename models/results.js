'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Results = sequelize.define('results', {
        poll_id: DataTypes.INTEGER,
        answer: DataTypes.STRING,
        user_id: DataTypes.INTEGER
    }, {});
    Results.associate = function (models) {
        // this.belongsTo(models.Polls, {foreignKey: 'user_id'});
    };
    return Results;
};