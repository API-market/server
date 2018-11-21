'use strict';

module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define('transactions', {
        poll_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        amount: DataTypes.DOUBLE
    }, {});
    Transactions.associate = function (models) {
        // this.belongsTo(models.Polls, {foreignKey: 'user_id'});
    };
    return Transactions;
};