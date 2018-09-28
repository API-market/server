const Joi = require('joi');
const {requestValidator} = require('lumeos_middlewares');

class UsersValidate {

    get logout() {
        return requestValidator(Joi
            .object()
            .keys({
                token_phone: Joi.string().required(),
            })
        )
    }
}

module.exports = new UsersValidate();