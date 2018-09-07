const schedule = require('node-schedule');

class CronJob {

    constructor() {
        /**
         * Every tow days in 11:00 AM
         */
        this.timePush = process.env.CRON_TIME_PUSH_NOTIFICATION ||  '0 11 */2 * *';

        this.pushNotificationsJob();
    }

    pushNotificationsJob() {
        // this.jobPush = schedule.scheduleJob(this.timePush, () => {
        //
        // });
    }
}

module.exports = new CronJob();