'use strict';

const serverInfo = require('../server_info.js');
const {ProfileImage, User} = require('../db_entities');
const SEED_AUTH = serverInfo.SEED_AUTH;
const USER_MAIN_LUMEOS = serverInfo.USER_MAIN_LUMEOS;

module.exports = {
    up: (queryInterface, Sequelize) => {
        return User.findOne({
            where: {
                email: USER_MAIN_LUMEOS
            }
        }).then((user) => {
            if (!user) {
                queryInterface.bulkInsert('users', [
                    {
                        lastName: 'Notification',
                        firstName: 'Lumeos',
                        email: USER_MAIN_LUMEOS,
                        password: SEED_AUTH,
                        createdAt: new Date(),
                        updatedAt: new Date(),

                    },
                ]);
                return ProfileImage.upsert({
                    user_id: user.id,
                    image: 'd335853c84e28984997b7c7e_logo.png'
                });
            }
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('users', {
            email: USER_MAIN_LUMEOS
        }, {});
    }
};
