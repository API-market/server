const express = require('express');
const {Op} = require('sequelize');
const {events} = require('lumeos_utils');
// const {check, validationResult} = require('express-validator/check');
// const util = require('../utilities.js');
const {User, CustomNotifications, Tokens} = require('../../db_entities.js');
const {USER_MAIN_LUMEOS} = require('../../server_info')

// const removeEmpty = util.removeEmpty;
const notificationsWebRouter = express.Router();

const notFound = (message) => {
    const err = new Error(message || 'Not found');
    err.status = 404;
    return err;
};

/**
 * Notification Web
 */
/**
 * Get all notifications
 */
notificationsWebRouter.get('/notifications', function (req, res) {
    CustomNotifications.findAll({}).then((users) => {
        res.render('notifications/index', {users});
    }).catch((error) => {
        res.render(`errors/${error.status || 500}`, {error});
    });
});

notificationsWebRouter.get('/notifications/edit/:id', function (req, res) {
    CustomNotifications.findOne({
        where: {
            id: req.params.id,
        },
    }).then((item) => {
        if (!item) {
            throw notFound()
        }
        return User.findAll({
            where: {
                id: {
                    [Op.in]: item.usersId
                }
            },
            attributes: [
                'id',
                'firstName',
                'lastName',
            ]
        }).then((selectedUser) => {
            return User.findAll().then((users) => {
                users.forEach((user) => {
                    selectedUser.map((selectedUser) => {
                        if (user.id === selectedUser.id) {
                            user.selected = true
                        }
                    })
                });
                res.render('notifications/entity', {item: item.toJSON(), users, action: `/web/notifications/edit/${item.id}`})
            })
        });
    }).catch((error) => {
        console.log(error);
        res.render(`errors/${error.status || 500}`, {error});
    });
});

notificationsWebRouter.post('/notifications/edit/:id', function (req, res) {
    CustomNotifications.update(Object.assign(req.body, {usersId: req.body.users}), {
        where: {
            id: req.params.id
        }
    })
        .then((item) => {
            res.redirect('/web/notifications');
        }).catch(error => {
        res.render(`errors/${error.status || 500}`, {error});
    });
});

notificationsWebRouter.get('/notifications/add', function (req, res) {
    User.findAll({
        attributes: ['id', 'firstName', 'lastName']
    }).then((users) => {
        res.render('notifications/entity', {users, item: {}, action: '/web/notifications/add'});
    }).catch((error) => {
        res.render(`errors/${error.status || 500}`, {error});
    })
});

notificationsWebRouter.post('/notifications/add', function (req, res) {
    CustomNotifications.create(Object.assign(req.body, {usersId: req.body.users}))
        .then(() => {
            res.redirect('/web/notifications');
        }).catch(error => {
        res.render(`errors/${error.status || 500}`, {error});
    });
});

notificationsWebRouter.post('/notifications/send/:id/:type?', function (req, res) {
    CustomNotifications.findById(req.params.id)
        .then((item) => {
            if (!item) throw notFound();
            const {title, description} = item;
            return User.findOne({
                where: {
                    email: USER_MAIN_LUMEOS
                }
            }).then((mainUser) => {
                if (!item) throw notFound('Main user not found');

                return User.findAll({
                    attributes: ['id'],
                    where: {
                        id: item.usersId,
                        [Op.or]: {
                            custom_notifications: true,
                            all_notifications: true
                        },
                    },
                    include: [
                        {association: User.Tokens}
                    ]
            })
                .then((users) => {
                    if (req.params.type && req.params.type === 'push') {
                        return Promise.all(users.map((user) => {
                            return User
                                .incrementOnePushNotification(user.id)
                                .then((count_notifications) => {
                                    user.tokens.map(({token: to}) => {
                                        console.log({
                                            to,
                                            title,
                                            body: description,
                                            count_notifications,
                                        });
                                        events.emit(events.constants.sendCustomNotificationsPush, {
                                            to,
                                            title,
                                            body: description,
                                            count_notifications,
                                        });
                                    });
                                    setTimeout(() => {
                                        return res.json({});
                                    }, 1000)
                                })
                        }));
                    }
                    users.map((user) => {
                        events.emit(events.constants.sendCustomNotifications, {
                            user_id: user.id,
                            from_user_id: mainUser.id,
                            title,
                            description
                        });
                    });
                    setTimeout(() => {
                        return res.json({});
                    }, 1000)
                });
            })

        }).catch(error => {
            res.render(`errors/${error.status || 500}`, {error});
        });
});

notificationsWebRouter.delete('/notifications/delete/:id', function (req, res) {
    CustomNotifications.destroy({
        where: {
            id: req.params.id
        }
    }).then((item) => {
        console.log(item);
        if (item === 0) throw notFound();
        res.setHeader('Location', '/web/notifications');
        res.json({});
    }).catch((error) => {
        console.log(error);
        res.render(`errors/${error.status || 500}`, {error});
    })
});

module.exports = notificationsWebRouter;
