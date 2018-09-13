'use strict';

module.exports = (sequelize, DataTypes) => {
    const Notifications = sequelize.define('notifications', {
        target_user_id: {type: DataTypes.INTEGER, allowNull: false},
        from_user_id: {type: DataTypes.INTEGER, allowNull: false},
        description: DataTypes.STRING,
        type: DataTypes.STRING,
    });
    Notifications.associate = function (models) {
        this.belongsTo(models.Users, {foreignKey: 'target_user_id', join: 'inner'});
    };
    return Notifications;
};