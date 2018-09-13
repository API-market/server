const {createTransport} = require('nodemailer');
const ejs = require('ejs');
const {join} = require('path');
const path = join(__dirname, '/../views/template_mail');

class MailService {

    constructor() {
        this.constants = {
            FORGOT_PASSWORD: 'forgot_password',
            VERIFY_USER: 'verify_user',
        };
        const tls = /^win/.test(process.platform) && {tls: {rejectUnauthorized: false}};
        this.senders = {
            auth: {
                user: process.env.LUMEOS_EMAIL_SENDER,
                pass: process.env.LUMEOS_EMAIL_PASSWORD,
            },
            ...tls
        };
        this.config = {
            // sender info
            from: process.env.LUMEOS_EMAIL_FROM,
            headers: {
                'X-Laziness-level': 1000 // just an example header, no need to use this
            }
        };
        if (process.env.LUMEOS_EMAIL_SERVICE) {
            Object.assign(this.senders, {
                service: process.env.LUMEOS_EMAIL_SERVICE
            })
        }
        if (process.env.LUMEOS_EMAIL_HOST) {
            Object.assign(this.senders, {
                host: process.env.LUMEOS_EMAIL_HOST
            })
        }
        this.transporter = createTransport(this.senders, this.config);
        this.ejs = ejs;
    }

    _message(subject, to, html, text, attachments) {
        return {
            to,
            subject,
            text,
            html,
            attachments
        };
    }

    _attachment(name, params) {
        let data = {
            filename: name,
        };
        if (params.constructor.name === 'String') {
            data.content = fs.createReadStream(params);
        } else if (params.constructor.name === 'Buffer') {
            data.content = params;
        }
        return [data];
    }

    /**
     * Send email to user
     * @param to
     * @param templateName
     * @param replacements
     * @param attachments
     * {this} MailService
     * @returns {Promise<any>}
     */
    send(to, templateName, replacements, attachments) {
        return new Promise((resolve, reject) => {
            this.renderTemplate(templateName, replacements).then((str) => {
                const options = this._message(
                    this.getTemplate[templateName].SUBJECT,
                    to,
                    str,
                    '',
                    attachments
                );
                this.transporter.sendMail(options, (err, data) => {
                    if (err) {
                        this.transporter.close();
                        reject(err);
                    }
                    // console.log('[mail-service] ', data);
                    this.transporter.close();
                    resolve(data)
                })
            }).catch(reject)
        })
    }

    renderTemplate(templateName, replacements) {
        return new Promise((resolve, reject) => {
            this.ejs.renderFile(
                this.getTemplate[templateName].PATH,
                {
                    HOST: process.env.HOST,
                    ...replacements
                },
                (err, str) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(str);
                }
            );
        });
    }

    get getTemplate() {
        return {
            [this.constants.FORGOT_PASSWORD]: {
                PATH: `${path}/forgot_password.ejs`,
                SUBJECT: '[Lumeos] Forgot password',
            },
            [this.constants.VERIFY_USER]: {
                PATH: `${path}/verify_user.ejs`,
                SUBJECT: '[Lumeos] Verify​ your ​email ​address',
            }
        };
    }

}


module.exports = MailService;
