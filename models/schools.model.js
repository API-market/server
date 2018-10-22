'use strict';


module.exports = (sequelize, DataTypes) => {

	const School = sequelize.define('schools', {
		schoolId: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
        name: DataTypes.STRING,
        emailDomain: DataTypes.STRING,
		countryId: DataTypes.INTEGER,

    }, {});

	School.associate = function (models) {
    };

    return School;
};
