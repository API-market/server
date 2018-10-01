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
                    const error = new Error('Validate Error');
                    error.errors = errors;
                    error.status = 422;
                    return next(error);
                }
                return next();
            }
            return next();
        };
    }

    getRequestBody(req) {
        if (req.params) {
            req.params = Object.keys(req.params).reduce((init, value) => {
                if (req.params[value]) {
                    init[value] = parseInt(req.params[value]) || req.params[value];
                }
                return init;
            }, {})
        }
        if (req.file) {
            Object.assign(req.body, {[req.file.fieldname]: req.file})
        }
        if (req.files) {
            Object.assign(req.body, req.files.reduce((init, file) => {
                init[file.fieldname] = file;
                return init;
            }));
        }
        switch (req.method) {
            case 'GET':
            case 'DELETE':
                return Object.assign(req.query, req.params) || {};
            case 'POST':
            case 'PUT':
            case 'PATCH':
                return Object.assign(req.body, req.params) || {};
            default :
                return req.body || {};
        }
    }
}

module.exports = new RequestValidatorMiddleware();