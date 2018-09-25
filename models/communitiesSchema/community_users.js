'use strict';

module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('community_users', {
        community_id: {
            type: Sequelize.INTEGER,
            references: {
                model: {
                    schema: schemaName,
                    tableName: 'community',
                },
                key: 'id',
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: {
                    tableName: 'users',
                },
                key: 'id',
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        }
    }, {
        schema: 'communities'
    });
    Address.associate = function (models) {

    };
    return Address;
};