const Joi = require('joi');
const {requestValidator} = require('lumeos_middlewares');

class CommunityPollsValidate {

    get list() {
        return requestValidator(Joi
            .object()
            .keys({
                community_id: Joi.number().integer(),
                question: Joi.string().valid(['asc', 'desc']),
                createdAt: Joi.string().valid(['asc', 'desc']),
            })
        );
    }

    get create() {
        return requestValidator(Joi
            .object()
            .keys({
                question: Joi
                    .string()
                    .required(),
                answers: Joi
                    .array()
                    .required(),
                tags: Joi
                    .array()
                    .required(),
                image: Joi
                    .object()
                    .keys({
                        fieldname: Joi.string().required(),
                        originalname: Joi.string().required(),
                        encoding: Joi.string().required(),
                        mimetype: Joi.string().valid(['image/jpeg', 'image/jpg', 'image/png']).required(),
                        buffer: Joi.binary().required(),
                        size: Joi.number().required(),
                    })
                    .options({
                        language: {
                            object: {
                                base: 'must be image file'
                            }
                        }
                    }),
                creator_id: Joi.ref("$auth.user_id"),
                community_id: Joi
                    .number()
                    .integer()
                    .required()
            }));
    }

    get update() {
        return requestValidator(Joi
            .object()
            .keys({
                id: Joi
                    .string()
                    .required(),
                name: Joi
                    .string()
                    .required(),
                description: Joi
                    .string()
                    .required(),
                image: Joi
                    .object()
                    .label('"image" must be file')
                    .keys({
                        fieldname: Joi.string().required(),
                        originalname: Joi.string().required(),
                        encoding: Joi.string().required(),
                        mimetype: Joi.string().valid(['image/jpeg', 'image/jpg', 'image/png']).required(),
                        buffer: Joi.binary().required(),
                        size: Joi.number().required(),
                    })
                    .options({
                        language: {
                            object: {
                                base: 'must be image file'
                            }
                        }
                    }),
            }));
    }

}

module.exports = new CommunityPollsValidate();