'use strict';

const schemaName = 'communities';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.sequelize.query(`
                ALTER TABLE communities.polls ALTER COLUMN answers TYPE TEXT USING answers::TEXT;
            `),
            queryInterface.sequelize.query(`
                ALTER TABLE communities.polls ALTER COLUMN tags TYPE TEXT USING tags::TEXT;
            `),
            queryInterface.changeColumn('polls', 'answers', {type: Sequelize.TEXT}),
            queryInterface.changeColumn('polls', 'tags', {type: Sequelize.TEXT}),
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.sequelize.query(`
                ALTER TABLE communities.polls ALTER COLUMN answers TYPE VARCHAR(255) USING answers::VARCHAR(255);
            `),
            queryInterface.sequelize.query(`
                ALTER TABLE communities.polls ALTER COLUMN tags TYPE VARCHAR(255) USING tags::VARCHAR(255);
            `),
            queryInterface.changeColumn('polls', 'answers', {type: Sequelize.STRING}),
            queryInterface.changeColumn('polls', 'tags', {type: Sequelize.STRING}),
        ]);
    }
};
