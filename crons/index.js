const schedule = require('node-schedule');
const {PollService} = require('lumeos_services');

class CronJob {

    constructor() {

        this.pollService = new PollService();
        /**
         * Every tow days in 11:00 AM
         */
        this.timePush = process.env.CRON_TIME_PUSH_NOTIFICATION ||  '0 11 * * 2,4';

        this.pushNotificationsJob();
        // this.pollService.getNotAnswersPull()

    }

    pushNotificationsJob() {
        this.jobPush = schedule.scheduleJob(this.timePush, () => {
            this.pollService.getNotAnswersPull()
        });
    }
}

module.exports = new CronJob();