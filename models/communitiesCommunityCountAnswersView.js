'use strict';

module.exports = (sequelize, DataTypes) => {
    const CommunitiesCountParticipantView = sequelize.define('communityCountAnswersView', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        count_answers: {
            type: DataTypes.BIGINT
        },
        rank: {
            type: DataTypes.BIGINT
        },
    }, {
        schema: 'communities',
        tableName: 'community_count_answers',
        timestamps: false
    });
    CommunitiesCountParticipantView.associate = (models) => {
        // CommunitiesCountParticipantView.hasMany(models.community)
    };
    return CommunitiesCountParticipantView;
};