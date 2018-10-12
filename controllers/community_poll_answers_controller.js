'use strict';

const {pollAnswers, communityPolls, communityTransactions} = require('lumeos_models');
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

    results(req, res, next) {

        const {poll_id} = req.params;
        const {user_id} = req.auth;

        return communityTransactions
            .findOrCreate({
                where: {community_poll_id: poll_id, user_id}
            })
            .then(() => communityPolls.findById(poll_id))
            .then(communityPollEntity => {
                const possibleAnswers = communityPollEntity.get(`answers`) || [];
                const getPollResults = pollAnswers.findAll({
                    where: {poll_id}
                });

                return Promise.all([communityPollEntity.get(), possibleAnswers, getPollResults]);
            })
            .then(([communityPoll, possibleAnswers, pollAnswersEntities]) => {

                const totals = {};
                possibleAnswers.forEach((el, i) => {
                    totals[i] = {
                        name: el,
                        count: 0,
                    };
                });

                pollAnswersEntities.forEach(pollAnswerEntity => {
                    const pollAnswer = pollAnswerEntity.get();
                    totals[pollAnswer.answer][`count`]++;
                });

                const results = {};
                possibleAnswers.forEach((answer, i) => {
                    results[totals[i][`name`]] = totals[i][`count`];
                });

                res.sendResponse({
                    poll_id: communityPoll.id,
                    question: communityPoll.question,
                    answers: results,
                });

            })
            .catch(next);
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

                    if (!communityPollsEntity.answers[req.body.answer]) {
                        throw errors.badRequest('Answer not exist');
                    }
                    Object.assign(req.body, {user_id});

                    return pollAnswers
                        .create(pollAnswers.formatData(req.body))
                        .then((pollAnswersNew) => {
                            res.sendResponse(pollAnswers.formatResponse(pollAnswersNew));
                        });
                });
            }).catch(next);
    }

}

module.exports = new CommunityPollAnswersController();
