
class ErrorsUtils extends Error {

    constructor() {
        super()
    }

    notFound(message = '') {
        this.message = 'Not found';
        this.status = 404;
        this.errors = message instanceof String && [{message}] || [].concat(message);

        return this;
    }

    forbidden(message = '') {
        this.message = message || 'Access denied';
        this.status = 403;
        this.errors =  message instanceof String && [{message}] || [].concat(message);

        return this;
    }

    badRequest(message = '') {
        this.message = 'Bad request';
        this.status = 400;
        this.errors =  message instanceof String && [{message}] || [].concat(message);

        return this;
    }
}

module.exports = new ErrorsUtils();