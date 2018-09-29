const {dbInstance} = require('../db_setup');
const {Tokens, User} = require('../db_entities');
const {events} = require('lumeos_utils');

/**
 * @class PollService
 * @final
 */

class PollService {

    /**
     * @this {PollService}
     */
    getNotAnswersPull() {
        Tokens.findAll({
            attributes: ['user_id', 'token'].concat([
                [dbInstance.literal(`(SELECT count(DISTINCT poll.id) 
                                            FROM polls AS poll 
                                            WHERE poll.id NOT IN (
                                                SELECT DISTINCT res.poll_id
                                                FROM results AS res
                                                WHERE res.user_id = "tokens"."user_id")
                                            )`), 'participant_not_answered'],
            ]),
            include: [{
                association: Tokens.User,
                required: true,
                attributes: ['all_notifications', 'not_answers_notifications', 'count_notifications']
            }]
        }).then(poll => {
            return Promise.all(poll.map((e) => {
                const {
                    token: to,
                    participant_not_answered,
                    user_id,
                    users: {
                        all_notifications,
                        not_answers_notifications,
                    }
                } = e.toJSON();
                if (participant_not_answered > 0) {
                    if (all_notifications || (!all_notifications && not_answers_notifications)) {
                        return User.incrementOnePushNotification(user_id).then((count_notifications) => {
                            return {
                                to,
                                count: participant_not_answered,
                                user_id,
                                count_notifications
                            };
                        });
                    }
                }
            })).then((result) => {
                console.log('[send-push] >', result);
                    result.map((data) => {
                        if (data) {
                            events.emit(events.constants.sendNotAnswersPoll, data)
                        }
                    })
                });

        }).catch(error => {
            console.log('[cron-push-error] ', error);
        });
    }

}

module.exports = PollService;
