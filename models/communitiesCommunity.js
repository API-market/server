'use strict';
const {UploadS3Service} = require('lumeos_services');

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
            type: DataTypes.STRING,
            get: function () {
                return this.getDataValue('image') && UploadS3Service.getImage(this.getDataValue('image'));
            }
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
        CommunitiesCommunity.belongsTo(models.countParticipantView, {foreignKey: 'id', as: 'members'});
    };
    CommunitiesCommunity.formatter = (models, _) => {
        CommunitiesCommunity.formatData = (data) => {
            return _.pick(data, ['name', 'description', 'creator_id']);
        };
        CommunitiesCommunity.formatResponse = (data) => {
            if (data instanceof Array) {
                return data.map(d => _.omit(d.toJSON(), ['updated_at']));
            }
            return _.omit(data.toJSON(), ['updated_at']);
        };
    };
    return CommunitiesCommunity;
};