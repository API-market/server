'use strict';

const {pollAnswers, communityPolls} = require('lumeos_models');
const {errors} = require('lumeos_utils');

class CommunityPollAnswersController {

    result(req, res, next) {
        const {poll_id} = req.params;
        const {user_id} = req.auth;
        return communityPolls.findById(poll_id)
            .then(() => {
                return pollAnswers.findAll({
                    where: {
                        poll_id,
                        user_id
                    }
                }).then((pollAnswersEntity) => {
                    if (!pollAnswersEntity.length) {
                        throw errors.badRequest('You not answered on this poll');
                    }
                    return pollAnswers
                        .scope('resultAnswers')
                        .findAll({
                            where: {
                                poll_id
                            }
                        })
                        .then((pollAnswersEntity) => {
                            res.sendResponse(pollAnswers.formatResponse(pollAnswersEntity));
                        });
                });
            }).catch(next);
    }

    create(req, res, next) {
        const {poll_id} = req.params;
        const {user_id} = req.auth;
        return communityPolls.findById(poll_id)
            .then((communityPollsEntity) => {
                return pollAnswers.findOne({
                    where: {
                        poll_id,
                        user_id
                    }
                }).then((pollAnswersEntity) => {
                    if (pollAnswersEntity) {
                        throw errors.badRequest('You already answered on this poll');
                    }
                    console.log(!(communityPollsEntity.answers.length < req.body.answer));
                    if (!communityPollsEntity.answers[req.body.answer]) {
                        throw errors.badRequest('Answer not exist');
                    }
                    Object.assign(req.body, {user_id});
                    console.log(pollAnswers.formatData(req.body), '<<<');
                    return pollAnswers.create(pollAnswers.formatData(req.body))
                        .then((pollAnswersNew) => {
                            res.sendResponse(pollAnswers.formatResponse(pollAnswersNew));
                        });
                });
            }).catch(next);
    }

}

module.exports = new CommunityPollAnswersController();