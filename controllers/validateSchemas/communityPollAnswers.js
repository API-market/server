const Joi = require('joi');
const {requestValidator} = require('lumeos_middlewares');

class CommunityPollAnswersValidate {

    get create() {
        return requestValidator(Joi
            .object()
            .keys({
                answer: Joi
                    .number()
                    .integer()
                    .required(),
                poll_id: Joi
                    .number()
                    .integer()
                    .required(),
                community_id: Joi
                    .number()
                    .integer()
                    .required()
            }));
    }

}

module.exports = new CommunityPollAnswersValidate();