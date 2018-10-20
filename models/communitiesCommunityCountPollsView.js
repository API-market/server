'use strict';

module.exports = (sequelize, DataTypes) => {
	const CommunitiesCountPollsView     = sequelize.define('communityCountPollsView', {
		community_id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		count_polls: {
			type: DataTypes.BIGINT
		},
	}, {
		schema: 'communities',
		tableName: 'community_count_polls',
		timestamps: false
	});
	CommunitiesCountPollsView.associate = (models) => {
	};
	return CommunitiesCountPollsView;
};
