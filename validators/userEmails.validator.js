const Joi = require('joi');
const {requestValidator} = require('lumeos_middlewares');

class UserEmailsValidate {

    get create() {
        return requestValidator(Joi
            .object()
            .keys({
                name: Joi
                    .string()
                    .optional(),
				type: Joi
                    .string()
                    .required(),
				email: Joi
					.string()
                    .email()
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
