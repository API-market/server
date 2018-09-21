'use strict';

const tableName = 'tokens';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.describeTable(tableName)
                .then(tableDefinition => {
                    if (tableDefinition.createdAt) return Promise.resolve();

                    return queryInterface.addColumn(
                        tableName,
                        'createdAt',
                        {
                            type: Sequelize.DATE,
                            defaultValue: new Date()
                        }
                    );
                }),
            queryInterface.describeTable(tableName)
                .then(tableDefinition => {
                    if (tableDefinition.updatedAt) return Promise.resolve();

                    return queryInterface.addColumn(
                        tableName,
                        'updatedAt',
                        {
                            type: Sequelize.DATE,
                            defaultValue: new Date()
                        } // or a different column
                    );
                })
        ]);
    },

    down: (queryInterface) => {
        return Promise.all([
            queryInterface.describeTable(tableName)
                .then(tableDefinition => {
                    if (tableDefinition.createdAt) {
                        return queryInterface.removeColumn(
                            tableName,
                            'createdAt',
                        );
                    }
                    return Promise.resolve();
                }),
            queryInterface.describeTable(tableName)
                .then(tableDefinition => {
                    if (tableDefinition.updatedAt) {
                        return queryInterface.removeColumn(
                            tableName,
                            'updatedAt',
                        );
                    }
                    return Promise.resolve();
                })
        ]);
    }
};
