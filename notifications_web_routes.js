const express = require('express');
const {check, validationResult} = require('express-validator/check');
const util = require('./utilities.js');
const {Notifications, User, getProfileImage} = require('./db_entities.js');

const removeEmpty = util.removeEmpty;
const notificationsWebRouter = express.Router();

/**
 * Notification Web
 */
notificationsWebRouter
    .route('/notifications/:notification_id?')
    /**
     * Get all notifications
     */
    .get(function (req, res) {
        res.json({
            ok: true
        })
    })
    .post(function (req, res) {
        res.json({
            ok: true
        })
    });


module.exports = notificationsWebRouter;
