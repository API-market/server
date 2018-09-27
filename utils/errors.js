
class ErrorsUtils extends Error {

    constructor() {
        super()
    }

    notFound(message, errors) {
        this.message = message || 'Not found';
        this.status = 404;
        this.errors = errors || [];

        return this;
    }

    forbidden(message, errors) {
        this.message = message || 'Access denied';
        this.status = 403;
        this.errors = errors || [];

        return this;
    }
}

module.exports = new ErrorsUtils();