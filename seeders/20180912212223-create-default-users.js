'use strict';

const serverInfo = require('../server_info.js');
const SEED_AUTH = serverInfo.SEED_AUTH;

module.exports = {
    up: (queryInterface, Sequelize) => {
        // return queryInterface.bulkInsert('users', [
        //     {
        //         lastName: 'Admin',
        //         firstName: 'Admin',
        //         email: `admin@lumeos.io`,
        //         password: SEED_AUTH,
        //         createdAt: new Date(),
        //         updatedAt: new Date(),
        //
        //     },
        //     {
        //         lastName: 'Test_1',
        //         firstName: 'Test_1',
        //         email: 'test_1@lumeos.io',
        //         password: 'p1ssword',
        //         createdAt: new Date(),
        //         updatedAt: new Date(),
        //     },
        //     {
        //         lastName: 'Test_2',
        //         firstName: 'Test_2',
        //         email: 'test_2@lumeos.io',
        //         password: 'p2ssword',
        //         createdAt: new Date(),
        //         updatedAt: new Date(),
        //     },
        // ], {ignoreDuplicates: true});
    },

    down: (queryInterface, Sequelize) => {
        // return queryInterface.bulkDelete('users', {
        //     where: {
        //         email: {
        //             [Sequelize.in]: ['admin@lumeos.io', 'test_1@lumeos.io', 'test_2@lumeos.io']
        //         }
        //     }
        // }, {});
    }
};
