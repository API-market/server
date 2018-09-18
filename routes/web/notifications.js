const express = require('express');
const {Op} = require('sequelize');
// const {check, validationResult} = require('express-validator/check');
// const util = require('../utilities.js');
const {User, CustomNotifications} = require('../../db_entities.js');

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
        attributes: Object.keys(CustomNotifications.attributes).concat([['body', 'description']])
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
        }).then((users) => {
            res.render('notifications/entity', {item: item.toJSON(), users, action: `/web/notifications/edit/${item.id}`});
        });
    }).catch((error) => {
        console.log(error);
        res.render(`errors/${error.status || 500}`, {error});
    });
});

notificationsWebRouter.post('/notifications/edit/:id', function (req, res) {
    CustomNotifications.update(Object.assign(req.body, {usersId: req.body.users}), {id: req.params.id})
        .then((item) => {
            console.log(item);
            res.redirect('/web/notifications');
        }).catch(error => {
        res.render(`errors/${error.status || 500}`, {error});
    });
});

notificationsWebRouter.get('/notifications/add', function (req, res) {
    User.findAll({
        attributes: ['id', 'firstName', 'lastName']
    }).then((users) => {
        res.render('notifications/entity', {users, item: {}});
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

notificationsWebRouter.delete('/notifications/delete/:id', function (req, res) {
    CustomNotifications.destroy({
        where: {
            id: req.params.id
        }
    }).then((item) => {
        if (item === 0) throw notFound();

        res.redirect('/web/notifications');
    }).catch((error) => {
        console.log(error);
        res.render(`errors/${error.status || 500}`, {error});
    })
});

module.exports = notificationsWebRouter;
