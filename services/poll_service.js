const {Poll, Tokens} = require('../db_entities');
const {PushService} = require('lumeos_services');
const util = require('../utilities');

/**
 * @class PollService
 * @final
 */
class PollService {

    /**
     * @this {PollService}
     * @returns {Promise<any>}
     */
    getNotAnswersPull() {
        return new Promise((resolve, reject) => {
            Tokens.findAll({
                // include: [Poll]
            }).then(poll => {
                poll = poll.map((e) => {
                    return e.toJSON()
                });
                // PushService.sendNotAswersPoll()

            }).catch(error => {
                reject(error);
            });
        });
    }
}


module.exports = PollService;
