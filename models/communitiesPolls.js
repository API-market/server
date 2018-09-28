'use strict';

const {UploadS3Service} = require('lumeos_services');

module.exports = (sequelize, DataTypes) => {
    const CommunitiesPolls = sequelize.define('communityPolls', {
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
            get: function () {
                return this.getDataValue('image') && UploadS3Service.getImage(this.getDataValue('image'));
            }
        },
        price: {type: DataTypes.DOUBLE, defaultValue: 0},
        answers: {
            type: DataTypes.STRING,
            get: function () {
                if (this.getDataValue('answers')) return JSON.parse(this.getDataValue('answers'));
            },
            set: function (val) {
                return this.setDataValue('answers', JSON.stringify(val));
            }
        },
        tags: {
            type: DataTypes.STRING,
            get: function () {
                if (this.getDataValue('tags')) return JSON.parse(this.getDataValue('tags'));
            },
            set: function (val) {
                return this.setDataValue('tags', JSON.stringify(val));
            }
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
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at',
    });

    CommunitiesPolls.associate = function (models) {
        CommunitiesPolls.belongsTo(models.community, {as: 'community', foreignKey: 'community_id'})
    };

    CommunitiesPolls.methods = (models, _, db) => {
        CommunitiesPolls.getList = ({where}, {order}) => {
            return CommunitiesPolls.findAll({
                where,
                include: [
                    {model: models.community, as: 'community'}
                ],
                order: order || [['id', 'desc']]
            });
        };
    };

    CommunitiesPolls.formatter = (models, _) => {
        CommunitiesPolls.formatData = (data) => {
            return _.pick(data, ['question', 'price', 'answers', 'tags', 'creator_id', 'community_id']);
        };
        CommunitiesPolls.formatResponse = (data) => {
            if (data instanceof Array) {
                return data.map(d => _.omit(d.toJSON(), ['updated_at']));
            }
            if (data.toJSON) {
                data = data.toJSON();
            }
            return _.omit(data, ['updated_at']);
        };
    };

    return CommunitiesPolls;
};