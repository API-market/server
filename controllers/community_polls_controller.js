'use strict';

const {communityPolls, community, pollAnswers, sequelize} = require('lumeos_models');
const {UploadS3Service} = require('lumeos_services');
const {errors} = require('lumeos_utils');

class CommunityPollsController {

    list(req, res, next) {
        let order = null;
        if (req.query) {
            const {createdAt, question} = req.query;
            if (createdAt && !question) {
                order = [['created_at', createdAt]];
            }
            if (question && !createdAt) {
                order = [['question', question]];
            }
        }
        const {community_id, poll_id: id} = req.params;
        return community.findById(community_id)
            .then((communityEntity) => {
                if (!communityEntity) throw errors.notFound('Community not exists');
                if (id) {
                    return communityPolls.getOne({
                        where: {
                            community_id,
                            id,
                        }
                    }, {order}).then((communityPollsEntity) => {
                        res.sendResponse(communityPolls.formatResponse(communityPollsEntity));
                    })
                }
                return communityPolls.getList({
                    where: {
                        community_id: +req.params.community_id
                    }
                }, {order})
                    .then((communityPollsEntity) => {
                        res.sendResponse(communityPolls.formatResponse(communityPollsEntity));
                    });
            })
            .catch(next);
    }

    create(req, res, next) {
        return sequelize.transaction((transaction) => {
            return community.findById(req.params.community_id, {transaction})
                .then((communityEntity) => {
                    if (!communityEntity) throw errors.notFound('Community not exists');

                    Object.assign(req.body, {creator_id: req.auth.user_id, community_id: req.params.community_id});
                    return communityPolls
                        .create(communityPolls.formatData(req.body), {transaction})
                        .then((communityPollsNew) => {
                            return UploadS3Service
                                .upload(req.body.image, 'community_polls')
                                .then(({file}) => {
                                    if (file) {
                                        return communityPollsNew
                                            .update({image: file}, {transaction})
                                            .then((communityUpdated) => {
                                                res.sendResponse(communityPolls.formatResponse(communityUpdated));
                                            });
                                    }
                                    return res.sendResponse(communityPolls.formatResponse(communityPollsNew));
                                });
                        });
                });
        }).catch(next);
    }

    update(req, res, next) {
        const {poll_id} = req.params;
        let community;

        return sequelize.transaction((transaction) => {
            return communityPolls.findById(poll_id)
			.then(communityPollsEntity => {
				if (!communityPollsEntity) {
					throw errors.notFound();
				}
				if (req.auth.user_id !== communityPollsEntity.creator_id) {
					throw errors.forbidden('This community not yours');
				}

				community = communityPollsEntity;
				return communityPollsEntity
			})
			.then(communityPollsEntity => pollAnswers.count({ where: {'poll_id': poll_id} }))
			.then(pollAnswersCount => {
				if (pollAnswersCount > 0) {
					throw errors.forbidden('You can`t edit poll. Someone already participated');
				}

				return community;
			})
			.then((communityPollsEntity) => {
				let oldImage = communityPollsEntity.image;
				return communityPollsEntity.update(communityPolls.formatData(req.body), {transaction})
				.then((CommunitiesPollsUpdated) => {
					return UploadS3Service
					.upload(req.body.image, 'community_polls')
					.then(({file}) => {
						if(!file){
							oldImage = null;
							return CommunitiesPollsUpdated;
						}
						return CommunitiesPollsUpdated
						.update({image: file}, {transaction})
						.then((CommunitiesPollsUpdated) => {
							return CommunitiesPollsUpdated;
						});
					});
				})
				.then((CommunitiesPollsUpdated) => {
					if(!oldImage)
						return res.sendResponse(communityPolls.formatResponse(CommunitiesPollsUpdated));

					return UploadS3Service
					.delete(oldImage)
					.then(() => {
						return res.sendResponse(communityPolls.formatResponse(CommunitiesPollsUpdated));
					});
				});
			});
        })
		.catch(next);
    }
}

module.exports = new CommunityPollsController();
