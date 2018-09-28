'use strict';
const {UploadS3Service} = require('lumeos_services');
// const {users, profileImages, countParticipantView, communityCountAnswersView} = require('lumeos_models');
const users = require('./users');

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
        CommunitiesCommunity.belongsTo(models.communityCountAnswersView, {foreignKey: 'id', as: 'answers'});
    };
    CommunitiesCommunity.methods = (models) => {

        CommunitiesCommunity.getList = (query, {order}) => {
            return CommunitiesCommunity.findAll({
                attributes: Object.keys(CommunitiesCommunity.attributes)
                    .filter(e => e !== 'creator_id')
                    .concat([
                        sequelize.literal('(SELECT 1+ 2) AS test')
                    ]),
                include: [{
                    model: models.users,
                        include: [{
                            model: models.profileImages,
                            attributes: ['image']
                        }],
                    attributes: ['id', 'firstName', 'lastName']
                    }, {
                        model: models.countParticipantView,
                        as: 'members',
                        attributes: ['count']
                    }, {
                        model: models.communityCountAnswersView,
                        as: 'answers',
                        attributes: ['count_answers', 'rank']
                }],
                order: order || [['id', 'desc']]
            })
        }
    };
    CommunitiesCommunity.formatter = (models, _) => {
        CommunitiesCommunity.formatData = (data) => {
            return _.pick(data, ['name', 'description', 'creator_id']);
        };
        CommunitiesCommunity.formatResponse = (data) => {
            if (data instanceof Array) {
                return data.map(d => _.omit(d.toJSON(), ['updated_at']));
            }
            if (data.toJSON) {
                data = data.toJSON()
            }
            return _.omit(data, ['updated_at']);
        };
    };
    return CommunitiesCommunity;
};