const Joi = require('joi');
const {requestValidator} = require('lumeos_middlewares');

class UserEmailsValidate {

    get create() {
        return requestValidator(Joi
            .object()
            .keys({
				type: Joi
                    .string()
                    .required(),
				email: Joi
					.string()
                    .email()
					.required(),
            }));
    }

    get update() {
        return requestValidator(Joi
            .object()
            .keys({
				type: Joi
                    .string()
                    .optional(),
				email: Joi
					.string()
                    .email()
					.optional(),
				emailId: Joi
					.number()
					.required(),
            }));
    }

    get delete() {
        return requestValidator(Joi
            .object()
            .keys({
				emailId: Joi
					.number()
					.required(),
            }));
    }

    get list() {
        return requestValidator(Joi
            .object()
            .keys({
				userId: Joi
                    .number()
                    .required(),
            })
		);
    }

    get verify() {
        return requestValidator(Joi
            .object()
            .keys({
				emailId: Joi
                    .number()
                    .required(),
            })
		);
    }

}

module.exports = new UserEmailsValidate();
