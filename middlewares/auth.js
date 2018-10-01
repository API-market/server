const jwt = require('jsonwebtoken');
const {SUPER_SECRET_JWT_KEY} = require('../server_info');

class AuthMiddleware {

    constructor() {
        this.init = this.init.bind(this);
    }

    /**
     * Its main method
     * @param req
     * @param res
     * @param next
     */
    init(req, res, next) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            req.auth = jwt.verify(token, SUPER_SECRET_JWT_KEY);
            next();
        } catch (err) {
            res.status(401).json({message: 'Unauthorized: JWT token not provided'});
        }
    }

}

module.exports = new AuthMiddleware();
