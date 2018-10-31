'use strict';

module.exports = (sequelize, DataTypes) => {
	const UserEmail = sequelize.define('userEmail', {

		id: {
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},

		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},

		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},

		name: {
			type: DataTypes.STRING,
			allowNull: true,
		},

		type: {
			type: DataTypes.STRING,
			allowNull: false,
		},

		verify: {type: DataTypes.BOOLEAN, defaultValue: false},
		verify_token: DataTypes.STRING,

		createdAt: {
			type: DataTypes.DATE,
			defaultValue: new Date()
		},
		updatedAt: {
			type: DataTypes.DATE,
			defaultValue: new Date()
		},

	}, {
		tableName: 'user_emails',
		timestamps: true,
		updatedAt: 'updatedAt',
		createdAt: 'createdAt',
		paranoid: true,
	});

	UserEmail.associate = function (models) {
		UserEmail.belongsTo(models.users, {as: 'user', foreignKey: 'userId'});
	};

	UserEmail.methods = (models, _, db) => {
	};

	return UserEmail;
};
