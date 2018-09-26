const Joi = require('joi');

class RequestValidatorMiddleware {

    constructor() {
        this.init = this.init.bind(this);
    }

    init(schema, options = {abortEarly: false}) {
        return (req, res, next) => {
            if (schema) {
                const data = this.getRequestBody(req);
                const result = Joi.validate(data, schema, options);

                if (result.error) {
                    const errors = result.error.details
                        .map(item => {
                            return {
                                message: item.message
                            };
                        });
                    return next(errors);
                }
                return next();
            }
            return next();
        };
    }

    getRequestBody(req) {
        switch (req.method) {
            case 'GET':
            case 'DELETE':
                return req.query || {};
            case 'POST':
            case 'PUT':
            case 'PATCH':
                return req.body || {};
            default :
                return req.body || {};
        }
    }
}

module.exports = new RequestValidatorMiddleware();