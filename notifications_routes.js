const express = require('express');
const {check, validationResult} = require('express-validator/check');
const util = require('./utilities.js');
const db_entities = require('./db_entities.js');
const Notifications = db_entities.Notifications;


const removeEmpty = util.removeEmpty;
const notificationsRouter = express.Router();

/**
 * Change notifications for current user
 */
notificationsRouter
    .route('/notifications/:notification_id?')
    /**
     * Get all notifications
     */
    .get(function (req, res) {
        Notifications.findAll({
            where: {
                target_user_id: parseInt(req.user.user_id)
            },
            attributes: [
                'id',
                'from_user_id',
                'description',
                'type',
                'createdAt',
            ]
        }).then((notifications) => {
            if (notifications.length) {
                return res.json(removeEmpty(notifications));
            }
            res.status(404).json({error: 'Not Found', message: 'Notifications not found'});
        }).catch((err) => {
            console.log(err);
            res.status(500).json({error: 'Error', message: 'Some error.'});
        });
    })
    /**
     * Remove notification by id
     */
    .delete([
        check('notification_id').exists().withMessage("Field 'notification_id' must be not empty."),
    ], function (req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({errors: errors.array()});
            }
            Notifications.destroy({
                where:  {
                    id: req.params.notification_id
                }
            }).then((data) => {
                if(!data) {
                    return res.status(404).json({error: 'Not Found', message: 'Notification not found'});
                }
                return res.status(204).json({});
            })
        } catch (err) {
            console.log(err);
            res.status(500).json({error: 'Error', message: 'Some error.'})
        }
    });


module.exports = notificationsRouter;
