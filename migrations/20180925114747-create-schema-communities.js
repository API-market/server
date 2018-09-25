'use strict';

const schemaName = 'communities';
module.exports = {
    up: (queryInterface, Sequelize) => {
        console.log(queryInterface.QueryGenerator.createTableQuery.toString());
        console.log(queryInterface.getQueryInterface());
        return queryInterface.createSchema(schemaName)
            .then(() => {
                return queryInterface.createTable('community', {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    created_at: {
                        type: Sequelize.DATE
                    },
                    updated_at: {
                        type: Sequelize.DATE
                    },
                    polls_at: {
                        type: Sequelize.DATE
                    },
                    name: {
                        type: Sequelize.STRING
                    },
                    description: {
                        type: Sequelize.STRING
                    },
                    image: {
                        type: Sequelize.STRING
                    },
                    owner_id: {
                        type: Sequelize.INTEGER,
                        references: {
                            model: 'users',
                            key: 'id'
                        },
                        onUpdate: 'cascade',
                        onDelete: 'cascade'
                    }
                }, {
                    schema: schemaName
                });
            }).then(() => {
                return queryInterface.createTable('community_users', {
                    community_id: {
                        type: Sequelize.INTEGER,
                        references: {
                            model: {
                                schema: schemaName,
                                tableName: 'community',
                            },
                            key: 'id',
                        },
                        onUpdate: 'cascade',
                        onDelete: 'cascade'
                    },
                    user_id: {
                        type: Sequelize.INTEGER,
                        references: {
                            model: {
                                tableName: 'users',
                            },
                            key: 'id',
                        },
                        onUpdate: 'cascade',
                        onDelete: 'cascade'
                    }
                }, {
                    schema: schemaName
                });
            });
    },

    down: (queryInterface) => {
        return queryInterface.dropSchema(schemaName).then(() => {
            return queryInterface.dropTable('community_users', {});
        }).then(() => {
            return queryInterface.dropTable('community', {});
        })
    }
};
