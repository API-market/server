const {createTransport} = require('nodemailer');
const ejs = require('ejs');
const {join} = require('fs');
const path = join(__dirname, '/../views/template_mail');

class MailService {

    constructor() {
        const tls = /^win/.test(process.platform) && {tls: {rejectUnauthorized: false}};
        this.transporter = createTransport({
            service: process.env.LUMEOS_EMAIL_SERVICE,
            auth: {
                user: process.env.LUMEOS_EMAIL_SENDER,
                pass: process.env.LUMEOS_EMAIL_PASSWORD,
            },
            ...tls
        });
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

    send(to, templateName, replacements, attachments) {
        return new Promise((resolve, reject) => {
            this.renderTemplate(templateName, replacements).then((err, str) => {
                if (err) {
                    return reject(err)
                }
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
                    this.transporter.close();
                    resolve(data)
                })
            })
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
            FORGOT_PASSWORD: {
                PATH: `${path}/forgot_password.ejs`,
                SUBJECT: 'Forgot password',
            }
        };
    }

}


module.exports = MailService;
