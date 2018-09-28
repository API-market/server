const {VERSION} = require('../server_info');
const {errors} = require('lumeos_utils');

class RequestValidatorMiddleware {

    constructor() {
        this.init = this.init.bind(this);
        this.errors = this.errors.bind(this);
    }

    init(req, res, next) {
        res.sendResponse = (data = {}, pagination = {}, status = 200) => {
            return res.status(status)
                .json({
                    v: VERSION,
                    data,
                    pagination,
                });
        };
        next();
    };

    error404(req, res, next) {
        const error = new Error('Not found');
        error.status = 404;
        error.errors = [];
        next(error)
    }

    dbError(error, req, res, next) {
        if (['SequelizeForeignKeyConstraintError', 'SequelizeUniqueConstraintError', 'SequelizeDatabaseError'].includes(error.name)) {
            error.status = 400;
            if (error.parent) {
                error.message = 'Bad Request';
                if (!error.parent) {
                    return error.errors = [
                        {message: error.original.message}
                    ];
                }
                error.errors = [
                    {message: (error.parent.detail || error.parent.message).replace(/[\(\)]/g, '')}
                ];
            }
        }
    }

    errors(error, req, res, next) {
        this.dbError(error);
        console.log(error);
        return res.status(error.status || 500)
            .json({
                message: error.message,
                errors: error.errors && error.errors.map((item) => {
                    return {
                        code: error.code,
                        message: item.message ? item.message : item,
                        key: item.key
                    };
                })
            });
    }
}

module.exports = new RequestValidatorMiddleware();