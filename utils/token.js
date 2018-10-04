const jwt = require('jsonwebtoken');
const {SUPER_SECRET_JWT_KEY} = require('../server_info.js');

class Token {

    constructor() {
        this.jwt = jwt;
    }

    /**
     * @this Token
     * @param data
     * @param options
     * @returns {Promise<any>}
     */
    generate(data, options) {
        return new Promise((resolve, reject) => {
            return this.jwt.sign({
                ...data,
                iat: Math.floor(new Date() / 1000)
            }, SUPER_SECRET_JWT_KEY, options, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    /**
     * Verify current token
     *
     * @param token
     * @this Token
     * @returns {Promise<any>}
     */
    verify(token) {
        return new Promise((resolve, reject) => {
            this.jwt.verify(token, SUPER_SECRET_JWT_KEY, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }
}

module.exports = Token;