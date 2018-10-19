'use strict';

module.exports = (sequelize, DataTypes) => {
    const CommunitiesPollCountAnswersView = sequelize.define('communityPollCountAnswersView', {
        poll_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        count_answers: {
            type: DataTypes.BIGINT
        },
    }, {
        schema: 'communities',
        tableName: 'poll_answers',
        timestamps: false
    });
	CommunitiesPollCountAnswersView.associate = (models) => {
    };
    return CommunitiesPollCountAnswersView;
};
