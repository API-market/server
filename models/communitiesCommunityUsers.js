'use strict';

module.exports = (sequelize, DataTypes) => {
    const CommunitiesCommunityUsers = sequelize.define('communityUsers', {
        community_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        schema: 'communities',
        tableName: 'community_users',
        timestamps: false
    });
    CommunitiesCommunityUsers.associate = function (models) {

    };
    return CommunitiesCommunityUsers;
};