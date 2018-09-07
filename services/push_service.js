const FCM = require('fcm-push');

/**
 * @class PushService
 * @final
 * @constructor
 */
class PushService {

    constructor(config) {
        // if (!process.env.FIREBASE_SERVER_SECRET) {
        //     throw new Error('Variable FIREBASE_SERVER_SECRET not exist');
        // }
        this.config = config;
        // this.client = new FCM(process.env.FIREBASE_SERVER_SECRET, this.config);
        this.message = {
            to: 'registration_token_or_topics',
            data: {
                your_custom_data_key: 'your_custom_data_value'
            },
            notification: {
                title: 'Title of your push notification',
                body: 'Body of your push notification'
            }
        };
    }

    /**
     * Send push notification on mobile
     *
     * @param to
     * @param data
     * @param notification
     * @this {PushService}
     * @returns {Promise}
     */
    send(to, data, notification) {
        return new Promise((resolve, reject) => {
            if (data) {
                Object.assign(this.message, {data});
            }
            if (notification) {
                Object.assign(this.message, {
                    notification: Object.assign(this.message.notification, notification)
                });
            }
            this.client.send(Object.assign(this.message, {to})).then((data) => {
                resolve(data);
            }).catch((err) => {
                console.error('[push-service-error]', err);
                reject(new Error('Error send push notification'));
            });
        });
    }

    /**
     * Answer on the poll
     *
     * @param to
     * @param nickname
     * @param data
     * @this {PushService}
     * @returns {Promise}
     */
    sendPolls(to, {nickname}, data) {
        return this.send(to, data, {
            title: 'Answered',
            body: `"${nickname}" answered your question.`
        })
    }

    /**
     * Get result by poll
     *
     * @param to
     * @param nickname
     * @param data
     * @final
     * @this {PushService}
     * @returns {Promise}
     */
    sendPollsResult(to, {nickname}, data) {
        return this.send(to, data, {
            title: 'Polls Result',
            body: `"${nickname}" purchased your poll results.`
        })
    }

    /**
     * Follow on the user
     *
     * @param to
     * @param nickname
     * @param data
     * @this {PushService}
     * @returns {Promise}
     */
    sendFollow(to, {nickname}, data) {
        return this.send(to, data, {
            title: 'Following',
            body: `"${nickname}" is following you.`
        })
    }

    /**
     * Cron notification for poll
     *
     * @param to
     * @param nickname
     * @param data
     * @this {PushService}
     * @returns {Promise}
     */
    sendNotAswersPoll(to, {count}, data) {
        return this.send(to, data, {
            title: 'Poll',
            body: `You have "${count}" not answer poll.`
        })
    }
}

module.exports = PushService;
