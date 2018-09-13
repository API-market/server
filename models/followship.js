'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Followships = sequelize.define('followships', {
        follower_id: DataTypes.INTEGER,
        followee_id: DataTypes.INTEGER
    }, {});
    Followships.associate = function (models) {
        // this.belongsTo(models.Polls, {foreignKey: 'user_id'});
    };
    return Followships;
};