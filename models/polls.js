'use strict';

const bcrypt = require('bcrypt');
const {UploadS3Service} = require('lumeos_services');

module.exports = (sequelize, DataTypes) => {
    const Polls = sequelize.define('polls', {
        question: DataTypes.STRING,
        price: {type: DataTypes.DOUBLE, defaultValue: 0},
        participant_count: {type: DataTypes.INTEGER, defaultValue: 0},
        avatar: {
            type: DataTypes.STRING,
            get: function () {
                return UploadS3Service.getImage(this.getDataValue('avatar'));
            }
        },
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
        }
    }, {});
    Polls.associate = function (models) {

    };
    return Polls;
};