'use strict';

const serverInfo = require('../server_info.js');
const {ProfileImage, User} = require('../db_entities')
const SEED_AUTH = serverInfo.SEED_AUTH;

module.exports = {
    up: (queryInterface, Sequelize) => {
        return [
            queryInterface.bulkDelete('users', {
                email: 'lumeos@lumeos.io'
            }, {}),
            queryInterface.bulkInsert('users', [
                {
                    lastName: 'Lumeos',
                    firstName: 'Lumeos',
                    email: `lumeos@lumeos.io`,
                    password: SEED_AUTH,
                    createdAt: new Date(),
                    updatedAt: new Date(),

                },
            ]),
            User.findOne({
                where: {
                    email: 'lumeos@lumeos.io'
                }
            }).then((user) => {
                return ProfileImage.upsert({
                    user_id: user.id,
                    image: ''
                })
            })
        ];
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('users', {
            email: 'lumeos@lumeos.io'
        }, {});
    }
};
