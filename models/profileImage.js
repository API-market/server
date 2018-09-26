'use strict';
const {UploadS3Service} = require('lumeos_services');

module.exports = (sequelize, DataTypes) => {
    const ProfileImages = sequelize.define('profileImages', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        image: {
            type: DataTypes.STRING,
            get: function () {
                if (this.getDataValue('image')) return UploadS3Service.getImage(this.getDataValue('image'));
            }
        },
    }, {
        tableName: 'profile_images'
    });
    ProfileImages.associate = function (models) {
        // ProfileImages.hasMany(models.polls, {foreignKey: 'user_id'});
    };
    return ProfileImages;
};