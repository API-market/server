'use strict';

module.exports = (sequelize, DataTypes) => {
    const CommunitiesPolls = sequelize.define('polls', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: new Date()
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: new Date()
        },
        question: DataTypes.STRING,
        image: {
            type: DataTypes.STRING,
        },
        price: {type: DataTypes.DOUBLE, defaultValue: 0},
        answers: {
            type: DataTypes.STRING,
        },
        tags: {
            type: DataTypes.STRING,
        },
        creator_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        community_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        schema: 'communities',
        tableName: 'polls',
        timestamps: false,
    });
    CommunitiesPolls.associate = function (models) {

    };
    return CommunitiesPolls;
};