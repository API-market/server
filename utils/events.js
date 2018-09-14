const {EventEmitter} = require('events');
const {Notifications} = require('../db_entities');
const {PushService} = require('lumeos_services');

const constants = {
    sendAnswerForPoll: 'event:create-answer-for-poll',
    sendAnswerForPollCallback: 'event:create-answer-for-poll-callback',
    sendResultForPoll: 'event:send-result-for-poll',
    sendResultForPollCallback: 'event:send-result-for-poll-callback',
    sendFolloweeFromFollower: 'event:send-followee-from-follower',
    sendFolloweeFromFollowerCallback: 'event:send-followee-from-follower-callback',
    sendNotAnswersPoll: 'event:send-not-answers-poll',
    sendNotAnswersPollCallback: 'event:send-not-answers-poll-callback',
    sendCustomNotifications: 'event:send-custom-notifications',
    sendCustomNotificationsCallback: 'event:send-custom-notifications-callback',
};

class Events extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(0);
        this.constants = constants;
        this.pushService = new PushService;

        this.on(constants.sendAnswerForPoll, this.sendAnswerForPoll.bind(this));
        this.on(constants.sendResultForPoll, this.sendResultForPoll.bind(this));
        this.on(constants.sendFolloweeFromFollower, this.sendFolloweeFromFollower.bind(this));
        this.on(constants.sendNotAnswersPoll, this.sendNotAnswersPoll.bind(this));
        this.on(constants.sendCustomNotifications, this.sendCustomNotifications.bind(this));
    }

    sendAnswerForPoll({all_notifications, target_user_id, from_user_id, not_answers_notifications}) {
        if (
            all_notifications ||
            (all_notifications && !not_answers_notifications)
        ) {
            Notifications.create({
                target_user_id,
                from_user_id,
                description: ` answered your question`,
                type: constants.sendAnswerForPoll
            }).then((data) => {
                this.emit(this.constants.sendAnswerForPollCallback, null, data);
            }).catch((err) => {
                console.log(`[${constants.sendAnswerForPoll}]`, err);
                this.emit(this.constants.sendAnswerForPollCallback, err);
            });
        }

        //TODO on the future
        // tokens.map((item) => {
        //     if (item.active) {
        //         pushService.sendPolls(item.to, {nickname}).then((data) => {
        //             this.emit(this.constants.sendAnswerForPollCallback, data);
        //         }).catch((err) => {
        //             console.log(`[${constants.sendAnswerForPoll}]`, err);
        //             this.emit(this.constants.sendAnswerForPollCallback, err);
        //         });
        //     }
        // });
    }

    sendResultForPoll({all_notifications, not_answers_notifications, target_user_id, from_user_id}) {
        if (
            all_notifications ||
            (all_notifications && !not_answers_notifications)
        ) {
            Notifications.create({
                target_user_id,
                from_user_id,
                description: ' purchased your poll results',
                type: constants.sendResultForPoll
            }).then((data) => {
                this.emit(this.constants.sendResultForPollCallback, null, data);
            }).catch((err) => {
                console.log(`[${constants.sendResultForPoll}]`, err);
                this.emit(this.constants.sendResultForPollCallback, err);
            });
        }
        //TODO on the future
        // tokens.map((item) => {
        //     if (item.active) {
        //         pushService.sendPollsResult(item.token, {nickname}).then((data) => {
        //             this.emit(this.constants.sendResultForPollCallback, data);
        //         }).catch((err) => {
        //             console.log(`[${constants.sendResultForPollCallback}]`, err);
        //             this.emit(this.constants.sendResultForPollCallback, err);
        //         });
        //     }
        // });
    }

    sendFolloweeFromFollower(params) {
        const {
            all_notifications,
            not_answers_notifications,
            follows_you_notifications,
            target_user_id,
            from_user_id
        } = params;
        console.log(`
            ${all_notifications}
            ${(all_notifications && !not_answers_notifications)}
            ${(!all_notifications && follows_you_notifications)}
        `);
        if (
            all_notifications
            || (all_notifications && !not_answers_notifications)
            || (!all_notifications && follows_you_notifications)
        ) {
            Notifications.create({
                target_user_id,
                from_user_id,
                description: ' is following you',
                type: constants.sendFolloweeFromFollower
            }).then((data) => {
                this.emit(this.constants.sendFolloweeFromFollowerCallback, null, data);
            }).catch((err) => {
                console.log(`[${constants.sendFolloweeFromFollower}]`, err);
                this.emit(this.constants.sendFolloweeFromFollowerCallback, err);
            });
        }

        //TODO on the future
        // tokens.map((item) => {
        //     if (item.active) {
        //         pushService.sendFollow(item.token, {nickname}).then((data) => {
        //             this.emit(this.constants.sendFolloweeFromFollowerCallback, data);
        //         }).catch((err) => {
        //             console.log(`[${constants.sendFolloweeFromFollowerCallback}]`, err);
        //             this.emit(this.constants.sendFolloweeFromFollowerCallback, err);
        //         });
        //     }
        // });
    }

    sendNotAnswersPoll({count, to, not_answers_notifications, user_id}) {
        const self = this;
        console.log({count, to, not_answers_notifications, user_id});
        Promise.all([
            Notifications.create({
                target_user_id: user_id,
                from_user_id: user_id,
                description: `You have "${count}" not answer poll.`,
                type: constants.sendNotAnswersPoll
            }),
            self.pushService.sendNotAnswersPoll(to, {count})
        ]).then((data) => {
            data.map(e => console.log(JSON.stringify(e)));
            self.emit(self.constants.sendNotAnswersPollCallback, null, data);
        }).catch((error) => {
            if (Object.keys(error).length) {
                console.log('[event-error] ', `\n${JSON.stringify(error)}\n`);
                self.emit(this.constants.sendNotAnswersPollCallback, error, null);
            }
        });
    }

    sendCustomNotifications({to, title, body}) {
        this.pushService.sendCustomNotifications(to, {title, body})
            .then((data) => {
                this.emit(this.constants.sendCustomNotificationsCallback, null, data);
            })
            .catch((error) => {
                console.log('[event-error] ', `\n${JSON.stringify(error)}\n`);
                this.emit(this.constants.sendCustomNotificationsCallback, error, null);
            });
    }
}

exports.constants = constants;
module.exports = Events;