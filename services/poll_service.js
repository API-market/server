const {dbInstance} = require('../db_setup');
const {Tokens} = require('../db_entities');
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
                attributes: ['all_notifications', 'not_answers_notifications']
            }]
        }).then(poll => {
            return poll.map((e) => {
                const {
                    token: to,
                    participant_not_answered: count,
                    user_id,
                    users: {
                        all_notifications,
                        not_answers_notifications,
                    }
                } = e.toJSON();
                if (count > 0) {
                    if (all_notifications || (!all_notifications && not_answers_notifications)) {
                        console.log('[send-push] >', user_id);
                        events.emit(events.constants.sendNotAnswersPoll, {to, count, not_answers_notifications, user_id})
                    }
                }
            });

        }).catch(error => {
            console.log('[cron-push-error] ', error);
        });
    }

}

module.exports = PollService;
