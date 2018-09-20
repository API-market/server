const request = require('request');

class MessageService {

    constructor() {
        if (!process.env.TWILIO_PRODUCTION_API_KEY) {
            // Find in https://www.twilio.com/console/authy/applications/134439/settings
            throw new Error(`Set environment TWILIO_PRODUCTION_API_KEY`);
        }
        this.VERSION = '0.1';
        this.apiKey = process.env.TWILIO_PRODUCTION_API_KEY;
        this.apiURL = 'https://api.authy.com';
        this.user_agent = 'PhoneVerificationRegNode/' + this.VERSION + ' (node ' + process.version + ')';
        this.headers = {
            'User-Agent': this.user_agent
        };

    }

    setOptions(options) {
        Object.assign(this, options);
        return this;
    }

    /**
     * send token
     * Error: { error_code: '60033',
                message: 'Phone number is invalid',
                errors: { message: 'Phone number is invalid' },
                success: false }
     * Response: { carrier: 'MTS Ukraine (Jeans (UMC)',
                   is_cellphone: true,
                   message: 'Text message sent to +380 66-770-0734.',
                   seconds_to_expire: 500,
                   uuid: '8bf35690-9ed8-0136-bf21-121efda76f56',
                   success: true }
     * @param phone_number
     * @param country_code
     * @param via
     */
    requestPhoneVerification(phone_number, country_code, via) {
        return this._request('post', '/protected/json/phones/verification/start', {
                'api_key': this.apiKey,
                'phone_number': phone_number,
                'via': via || 'sms',
                'country_code': country_code,
                'code_length': 4
            }
        );
    };

    /**
     * verify token
     * Error { message: 'No pending verifications for +380 66-770-0734 found.',
               success: false,
               errors: { message: 'No pending verifications for +380 66-770-0734 found.' }, error_code: '60023' }
     * Response { message: 'Verification code is correct.', success: true }
     * @param phone_number
     * @param country_code
     * @param code
     */
    verifyPhoneToken(phone_number, country_code, code) {
        return this._request('get', '/protected/json/phones/verification/check', {
                'api_key': this.apiKey,
                'verification_code': code,
                'phone_number': phone_number,
                'country_code': country_code
            }
        );
    };

    _request(type, path, params, callback, qs) {
        return new Promise((resolve, reject) => {
            qs = qs || {};
            qs['api_key'] = this.apiKey;

            const options = {
                url: this.apiURL + path,
                form: params,
                headers: this.headers,
                qs: qs,
                json: true,
                jar: false,
                strictSSL: true
            };

            const callback_check = function (err, res, body) {
                if (!err) {
                    resolve(body, res);
                } else {
                    reject(err);
                }
            };

            switch (type) {
                case 'post':
                    request.post(options, callback_check);
                    break;

                case 'get':
                    request.get(options, callback_check);
                    break;
            }
        });
    };

}

module.exports = message = new MessageService();


