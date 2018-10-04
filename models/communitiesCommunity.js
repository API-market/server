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
        isJoin: {
            type: DataTypes.VIRTUAL
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
        timestamps: true,
		updatedAt: 'updated_at',
		createdAt: 'created_at',
		paranoid: true,
    });
    CommunitiesCommunity.associate = (models) => {
        CommunitiesCommunity.belongsTo(models.users, {foreignKey: 'creator_id'});
        CommunitiesCommunity.belongsTo(models.countParticipantView, {foreignKey: 'id', as: 'members'});
        CommunitiesCommunity.belongsTo(models.communityCountAnswersView, {foreignKey: 'id', as: 'answers'});
    };
    CommunitiesCommunity.methods = (models, _, db) => {
        CommunitiesCommunity.getList = (query, {order, user_id}) => {
            return CommunitiesCommunity.findAll({
                attributes: Object.keys(CommunitiesCommunity.attributes)
                    .filter(e => e !== 'creator_id')
                    .concat([[
                        sequelize.literal(`(
                            SELECT CASE WHEN count(c_cu.community_id) > 0 THEN TRUE ELSE FALSE END
                            FROM communities.community_users AS c_cu
                            WHERE c_cu.user_id = ${user_id} 
                            AND community.id = c_cu.community_id
                            )`), 'is_joined'
                    ]]),
                include: [
                    {
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
                    }
                ],
                order: order || [['id', 'desc']]
            });
        };
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
                data = data.toJSON();
            }
            return _.omit(data, ['updated_at']);
        };
    };
    return CommunitiesCommunity;
};
