const express = require('express');
// const {check, validationResult} = require('express-validator/check');
// const util = require('../utilities.js');
// const {Notifications, User, getProfileImage} = require('../db_entities.js');

// const removeEmpty = util.removeEmpty;
const notificationsWebRouter = express.Router();

/**
 * Home
 */
/**
 * Get all notifications
 */
notificationsWebRouter.get('/', function (req, res) {
    res.render('home/index');
});

notificationsWebRouter.get('/logout', function (req, res) {
    res.setHeader('Authorization', 'Basic xxx');
    res.redirect(401, '/web');
});

module.exports = notificationsWebRouter;
