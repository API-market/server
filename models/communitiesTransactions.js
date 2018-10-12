'use strict';

const {schemaNames} = require('lumeos_models');

module.exports = (sequelize, DataTypes) => {

    const CommunitiesTransactions = sequelize.define('communityTransactions', {
        created_at: {
            type: DataTypes.DATE,
            defaultValue: new Date()
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: new Date()
        },
        community_poll_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        user_id: DataTypes.INTEGER,
    }, {
        tableName: 'transactions',
        schema: schemaNames.communities,
        timestamps: false
    });
    CommunitiesTransactions.associate = function (models) {

    };
    return CommunitiesTransactions;
};