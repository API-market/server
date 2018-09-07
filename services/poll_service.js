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
            attributes: Object.keys(Tokens.attributes).concat([
                [dbInstance.literal(`(SELECT count(poll.id) 
                                            FROM polls AS poll 
                                            WHERE poll.creator_id = tokens.user_id 
                                                AND poll.participant_count = 0)`), 'participant_not_answered']
            ])
        }).then(poll => {
            poll.map((e) => {
                const {token: to, participant_not_answered: count} = e.toJSON();
                events.emit(events.constants.sendNotAnswersPoll, {to, count})
            });

        }).catch(error => {
            console.log('[cron-push-error] ', error);
        });
    }
}


module.exports = PollService;
