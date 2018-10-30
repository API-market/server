const Joi = require('joi');
const {requestValidator} = require('lumeos_middlewares');

class ImagesValidate {

    get create() {
        return requestValidator(Joi
            .object()
            .keys({
                name: Joi
                    .string()
                    .optional(),
				entityType: Joi
                    .string()
                    .optional(),
				entityId: Joi
					.number()
					.optional(),
				image: Joi
                    .object()
					.required()
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

    get list() {
        return requestValidator(Joi
            .object()
            .keys({
				entityType: Joi
                    .string()
                    .optional(),
				entityId: Joi
					.number()
					.optional(),
            })
		);
    }

    get update() {
		return requestValidator(Joi
			.object()
			.keys({
				name: Joi
					.string()
					.optional(),
				entityType: Joi
					.string()
					.optional(),
				entityId: Joi
					.number()
					.optional(),
				imageId: Joi
					.number()
					.required(),
			}));
    }

}

module.exports = new ImagesValidate();
