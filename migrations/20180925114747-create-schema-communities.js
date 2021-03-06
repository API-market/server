'use strict';
const {migration} = require('lumeos_utils');
const db = require('lumeos_models');
const {count_participant, poll_answers, community_count_answers, constants} = require('../migrations_views');

const schemaName = db.schemaNames.communities;
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createSchema(schemaName)
            .then(() => {
                return queryInterface.createTable('community', {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
                    },
                    polls_at: {
                        type: Sequelize.DATE
                    },
                    name: {
                        type: Sequelize.STRING,
                        allowNull: false
                    },
                    description: {
                        type: Sequelize.STRING
                    },
                    image: {
                        type: Sequelize.STRING
                    },
                    creator_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
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
            }).then(() => {
                return migration.createView(queryInterface, constants.countParticipant, count_participant(), {schema: schemaName});
            }).then(() => {
                return queryInterface.createTable('polls', {
                    id: {
                        allowNull: false,
                        autoIncrement: true,
                        primaryKey: true,
                        type: Sequelize.INTEGER
                    },
                    created_at: {
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    },
                    question: Sequelize.STRING,
                    image: {
                        type: Sequelize.STRING,
                    },
                    price: {type: Sequelize.DOUBLE, defaultValue: 0},
                    answers: {
                        type: Sequelize.STRING,
                    },
                    tags: {
                        type: Sequelize.STRING,
                    },
                    creator_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                    },
                    community_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                    }
                }, {schema: schemaName});
            }).then(() => {
                return queryInterface.createTable('polls_answers', {
                    created_at: {
                        type: Sequelize.DATE,
                        defaultValue: new Date()
                    },
                    updated_at: {
                        type: Sequelize.DATE,
                        defaultValue: new Date()
                    },
                    poll_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: {
                            model: {
                                schema: schemaName,
                                tableName: 'polls',
                            },
                            key: 'id',
                        },
                        onUpdate: 'cascade',
                        onDelete: 'cascade'
                    },
                    answer: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    }
                    ,
                    user_id: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    }
                }, {schema: schemaName});
            }).then(() => {
                return queryInterface.addConstraint(`${schemaName}.polls_answers`, ['poll_id', 'answer', 'user_id'], {
                    type: 'unique',
                });
            }).then(() => {
                return migration.createView(queryInterface, constants.pollAnswers, poll_answers(), {schema: schemaName});
            }).then(() => {
                return migration.createView(queryInterface, constants.communityCountAnswers, community_count_answers(), {schema: schemaName});
            });
    },

    down: (queryInterface) => {
        return migration.dropView(queryInterface, constants.communityCountAnswers, null, {schema: schemaName})
            .then(() => {
                return migration.dropView(queryInterface, constants.pollAnswers, null, {schema: schemaName});
            }).then(() => {
                return migration.dropView(queryInterface, constants.countParticipant, null, {schema: schemaName});
            }).then(() => {
                return queryInterface.dropTable('polls_answers', {schema: schemaName});
            }).then(() => {
                return queryInterface.dropTable('polls', {schema: schemaName});
            }).then(() => {
                return queryInterface.dropTable('community_users', {schema: schemaName});
            }).then(() => {
                return queryInterface.dropTable('community', {schema: schemaName});
            }).then(() => {
                queryInterface.dropSchema(schemaName)
            }).catch(console.log);
    }
};
