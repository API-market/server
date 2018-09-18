'use strict';

module.exports = (sequelize, DataTypes) => {
    const CustomNotifications = sequelize.define('custom_notifications', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        title: DataTypes.STRING,
        description: Sequelize.TEXT,
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        usersId: {
            type: Sequelize.STRING,
            get: function () {
                if (this.getDataValue('answers')) return JSON.parse(this.getDataValue('answers'));
            },
            set: function (val) {
                return this.setDataValue('answers', JSON.stringify(val));
            }
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        }
    }, {timestamps: true});
    // CustomNotifications.associate = function (models) {
    //     this.belongsTo(models.Users, {foreignKey: 'target_user_id', join: 'inner'});
    // };
    return CustomNotifications;
};