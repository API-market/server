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
    }

    sendAnswerForPoll({all_notifications, nickname, target_user_id, from_user_id}) {
        if (all_notifications) {
            Notifications.create({
                target_user_id,
                from_user_id,
                description: `"${nickname}" answered your question`,
                type: constants.sendAnswerForPoll
            }).then((data) => {
                this.emit(this.constants.sendAnswerForPollCallback, data);
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

    sendResultForPoll({all_notifications, nickname, target_user_id, from_user_id}) {
        if (all_notifications) {
            Notifications.create({
                target_user_id,
                from_user_id,
                description: `"${nickname}" purchased your poll results`,
                type: constants.sendResultForPoll
            }).then((data) => {
                this.emit(this.constants.sendResultForPollCallback, data);
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

    sendFolloweeFromFollower({all_notifications, nickname, target_user_id, from_user_id}) {
        if (all_notifications) {
            Notifications.create({
                target_user_id,
                from_user_id,
                description: `"${nickname}" is following you`,
                type: constants.sendFolloweeFromFollower
            }).then((data) => {
                this.emit(this.constants.sendFolloweeFromFollowerCallback, data);
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

    sendNotAnswersPoll(token, count) {
        this.pushService.sendNotAnswersPoll(token, {count}).then((data) => {
            console.log(data, '<<<<< success >>>>', token);
            this.emit(this.constants.sendNotAnswersPollCallback, data);
        }).catch((err) => {
            console.log(`[${constants.sendNotAnswersPollCallback}]`, err);
            this.emit(this.constants.sendNotAnswersPollCallback, err);
        });
    }
}

exports.constants = constants;
module.exports = Events;