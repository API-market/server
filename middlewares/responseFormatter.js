const {VERSION} = require('../server_info');

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
        next(error)
    }

    errors(error, req, res, next) {
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