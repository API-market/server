const express = require('express');
const {check, validationResult} = require('express-validator/check');
const util = require('./utilities.js');
const {Notifications, User, getProfileImage} = require('./db_entities.js');

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
            order: [['id', 'DESC']],
            attributes: [
                'id',
                'from_user_id',
                'description',
                'type',
                'createdAt',
            ],
            include: [
                {
                    model: User,
                    required: true,
                    attributes: [['id', 'user_id'], 'firstName', 'lastName']
                }
            ]
        }).then((notifications) => {
            if (notifications.length) {
                return Promise.all(notifications.map((notifications) => {
                    return getProfileImage(notifications.user.get('user_id'))
                        .then((image) => {
                            notifications.user.dataValues['profile_image'] = image;
                        });
                })).then(() => {
                    return res.json(removeEmpty(notifications));
                }).catch((err) => {
                    console.log(err);
                    res.status(500).json({error: 'Error', message: 'Some error.'});
                });
            }
            res.status(404).json({error: 'Not Found', message: 'Notifications not found'})
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
                    target_user_id: req.user.user_id,
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
