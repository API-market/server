'use strict';

const schemaName = 'communities';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addConstraint(`${schemaName}.community`, ['name'], {
            type: 'unique',
            name: 'community_unique'
        }).catch(console.log);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeConstraint(`${schemaName}.community`, 'community_unique').catch(console.log);
    }
};
