'use strict';

module.exports = (sequelize, DataTypes) => {
    const CommunitiesPollAnswers = sequelize.define('pollAnswers', {
        created_at: {
            type: DataTypes.DATE,
        },
        updated_at: {
            type: DataTypes.DATE,
        },
        poll_id: {
            type: DataTypes.INTEGER,
        },
        answer: {
            type: DataTypes.INTEGER,
        },
        user_id: {
            type: DataTypes.INTEGER,
        }
    }, {
        schema: 'communities',
        tableName: 'poll_answers',
        timestamps: false
    });
    CommunitiesPollAnswers.associate = (models) => {

    };
    return CommunitiesPollAnswers;
};