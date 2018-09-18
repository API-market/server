
class BasicAuthMiddleware {

    constructor() {
        const {ADMIN_USERNAME, ADMIN_PASSWORD} = process.env;
        this.username = ADMIN_USERNAME;
        this.password = ADMIN_PASSWORD;
        this.init = this.init.bind(this);
    }

    /**
     * Its main method
     * @param req
     * @param res
     * @param next
     */
    init(req, res, next) {
        this.basicAuthSetHeader(req, res, next);
    }

    basicAuthSetHeader(req, res, next) {
        const auth = req.headers['authorization'];
        if (!auth) {
            return this.responseAuth(res);
        } else if (auth) {
            this.checkAuth(auth, res, next);
        }
    }

    checkAuth(auth, res, next) {
        const [, token] = auth.split(' ');
        const buf = new Buffer(token, 'base64'); // create a buffer and tell it the data coming in is base64
        const currentAuth = buf.toString();
        const [username, password] = currentAuth.split(':');
        if (username === this.username && password === this.password) {
            res.locals.token = token;
            next();
        } else {
            console.error(`username: ${username || 'empty'}, password: ${password || 'empty'} not correct`);
            return this.responseAuth(res);
        }
    }

    responseAuth(res) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        res.status(401);
        return res.end('Basic Auth');
    }
}

module.exports = new BasicAuthMiddleware();
