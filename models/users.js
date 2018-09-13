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
        verify_token: Sequelize.STRING,
        phone: DataTypes.STRING,
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
        verify: {type: Sequelize.BOOLEAN, defaultValue: false},
    }, {});
    // Users.associate = (models) => {
        // console.log(this, '<<< users');
        // Users.hasMany(models.tokens, {as: 'tokens', foreignKey: 'user_id'});
        // Users.belongsTo(models.addresses, {as: 'address', constraints: false});
    // };
    return Users;
};