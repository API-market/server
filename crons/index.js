const schedule = require('node-schedule');
const {pollService} = require('lumeos_services');

class CronJob {

    constructor() {
        /**
         * Every tow days in 11:00 AM
         */
        this.timePush = process.env.CRON_TIME_PUSH_NOTIFICATION ||  '0 11 */2 * *';

        this.pushNotificationsJob();
    }

    pushNotificationsJob() {
        // console.log(, '<<');
        // TODO uncoment
        // pollService.getNotAnswersPull()
        // pollService.getNotAnswersPull();
        // this.jobPush = schedule.scheduleJob(this.timePush, () => {
        //
        // });
    }
}

module.exports = new CronJob();