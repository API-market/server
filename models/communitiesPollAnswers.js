'use strict';

const {model} = require('lumeos_utils');

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
            primaryKey: true,
        },
        answer: {
            type: DataTypes.INTEGER,
        },
        count: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('count'))
                    return parseInt(this.getDataValue('count'));
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
        }
    }, {
        schema: 'communities',
        tableName: 'polls_answers',
        timestamps: false,
        scopes: {
            resultAnswers: () => ({
                attributes: [
                    'answer',
                    [sequelize.literal('count(poll_id)'), 'count'],
                ],
                group: ['answer'],
            })
        }
        // TODO in future change field in integer
        // hooks: Object.assign({}, model.defaultHooks)
    });
    CommunitiesPollAnswers.associate = (models) => {

    };

    CommunitiesPollAnswers.formatter = (models, _) => {
        CommunitiesPollAnswers.formatData = (data) => {
            return _.pick(data, ['poll_id', 'answer', 'user_id']);
        };
        CommunitiesPollAnswers.formatResponse = (data) => {
            if (data instanceof Array) {
                return data.map(d => _.omit(d.toJSON(), ['updated_at']));
            }
            if (data.toJSON) {
                data = data.toJSON();
            }
            return _.omit(data, ['updated_at']);
        };
    };
    return CommunitiesPollAnswers;
};