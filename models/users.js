'use strict';

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('users', {
        eos: DataTypes.STRING,
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            set: function (val) {
                if (val)
                    return this.setDataValue('password', bcrypt.hashSync(val, bcrypt.genSaltSync(8)));
            }
        },
        forgot_token: DataTypes.STRING,
        verify_token: DataTypes.STRING,
        phone: DataTypes.STRING,
        phone_code: DataTypes.STRING,
        tag_line: DataTypes.STRING,
        dob: DataTypes.STRING,
        gender: DataTypes.STRING,
        school: DataTypes.STRING,
        employer: DataTypes.STRING,
        balance: {type: DataTypes.DOUBLE, defaultValue: 500},
        followee_count: {type: DataTypes.INTEGER, defaultValue: 0},
        follower_count: {type: DataTypes.INTEGER, defaultValue: 0},
        answer_count: {type: DataTypes.INTEGER, defaultValue: 0},
        all_notifications: {type: DataTypes.BOOLEAN, defaultValue: true},
        verify: {type: DataTypes.BOOLEAN, defaultValue: false},
        verify_phone: {type: DataTypes.BOOLEAN, defaultValue: false},
        not_answers_notifications: {type: DataTypes.BOOLEAN, defaultValue: true},
        follows_you_notifications: {type: DataTypes.BOOLEAN, defaultValue: true},
        custom_notifications: {type: DataTypes.BOOLEAN, defaultValue: true},
        count_notifications: {type: DataTypes.INTEGER, defaultValue: 0},
		schoolId: { type: DataTypes.INTEGER, allowNull: true },
    }, {
        tableName: 'users'
    });
    Users.associate = (models) => {
        Users.hasOne(models.profileImages, {foreignKey: 'user_id'});

        // Users.hasMany(models.tokens, {as: 'tokens', foreignKey: 'user_id'});
        // Users.belongsTo(models.addresses, {as: 'address', constraints: false});
    };
    return Users;
};
