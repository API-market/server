'use strict';

module.exports = (sequelize, DataTypes) => {
    const CommunitiesCountParticipantView = sequelize.define('countParticipantView', {
        community_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        count: {
            type: DataTypes.BIGINT
        },
    }, {
        schema: 'communities',
        tableName: 'count_participant',
        timestamps: false
    });
    CommunitiesCountParticipantView.associate = (models) => {
        // CommunitiesCountParticipantView.hasMany(models.community)
    };
    return CommunitiesCountParticipantView;
};