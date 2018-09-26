'use strict';

module.exports = (sequelize, DataTypes) => {
    const CommunitiesCommunity = sequelize.define('community', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        created_at: {
            type: DataTypes.DATE
        },
        updated_at: {
            type: DataTypes.DATE
        },
        polls_at: {
            type: DataTypes.DATE
        },
        name: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        image: {
            type: DataTypes.STRING
        },
        creator_id: {
            type: DataTypes.INTEGER,
        }
    }, {
        schema: 'communities',
        tableName: 'community',
        timestamps: false
    });
    CommunitiesCommunity.associate = (models) => {
        CommunitiesCommunity.belongsTo(models.users, {foreignKey: 'creator_id'});
        CommunitiesCommunity.belongsTo(models.countParticipantView, {foreignKey: 'id', as: 'members'})
    };
    return CommunitiesCommunity;
};