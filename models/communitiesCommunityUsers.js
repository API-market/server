'use strict';

module.exports = (sequelize, DataTypes) => {
    const CommunitiesCommunityUsers = sequelize.define('communityUsers', {
        community_id: {
            type: DataTypes.INTEGER,
        },
        user_id: {
            type: DataTypes.INTEGER,
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