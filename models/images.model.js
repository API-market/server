'use strict';


module.exports = (sequelize, DataTypes) => {

	const Images = sequelize.define('images', {
		imageId: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},

		userId: DataTypes.INTEGER,

		entityId: DataTypes.INTEGER,
		entityType: DataTypes.STRING,

		imageUrl: DataTypes.STRING,
		originalImageUrl: DataTypes.STRING,

		key: DataTypes.STRING, // crop_resize_1024_768

		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
		deletedAt: DataTypes.DATE,

    },
		{timestamps: true, paranoid: true}
    );

	Images.associate = function (models) {
    };

    return Images;
};
