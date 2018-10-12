const Joi = require('joi');
const {requestValidator} = require('lumeos_middlewares');
const {joi} = require('lumeos_utils');

class CommunityPollsValidate {

    constructor() {
        this.pollsSchema = Joi
            .object()
            .keys({
                question: Joi
                    .string()
                    .required(),
                answers: Joi
                    .array()
                    .items(Joi.string().required())
                    .required(),
                tags: Joi
                    .array()
                    .items(Joi.string().required())
                    .required(),
                avatar: Joi
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
                creator_id: Joi.ref('$auth.user_id'),
                community_id: Joi
                    .number()
                    .integer()
                    .required()
            });
    }

    get list() {
        return requestValidator(Joi
            .object()
            .keys({
                community_id: Joi.number().integer(),
                poll_id: Joi.number().integer(),
                question: Joi.string().valid(['asc', 'desc']),
                createdAt: Joi.string().valid(['asc', 'desc']),
				isAnswered: Joi.number().integer(),
				isBought: Joi.number().integer(),
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
                    .items(Joi.string().required())
                    .required(),
                tags: Joi
                    .array()
                    .items(Joi.string().required())
                    .required(),
                avatar: Joi
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
                creator_id: Joi.ref('$auth.user_id'),
                community_id: Joi
                    .number()
                    .integer()
                    .required()
            }));
    }

    get update() {
        const {pollsSchema} = this;
        const schemas = joi.mergeSchema([
            Joi
                .object()
                .keys({
                    poll_id: Joi
                        .number()
                        .integer()
                        .required(),

                }),
            pollsSchema
        ]);
        return requestValidator(schemas);
    }

    get delete() {
		return requestValidator(Joi
			.object()
			.keys({
				community_id: Joi.number().integer().required(),
				poll_id: Joi.number().integer().required(),
			})
		);
    }

}

module.exports = new CommunityPollsValidate();
