const Joi = require('joi');
const {requestValidator} = require('lumeos_middlewares');

class VersionsValidate {

    get get() {
        return requestValidator(Joi
            .object()
            .keys({
				// TODO: can't validate semver as string, bc requestValidator
				// converts req.params to string
                version: Joi.string().regex(/(\d*\.\d*\.\d*)/),
            })
        );
    }

}

module.exports = new VersionsValidate();
