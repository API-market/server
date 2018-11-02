const {community, communityUsers, sequelize} = require('lumeos_models');
const {model} = require('lumeos_utils');
const {UploadService, UploadS3Service, communitiesService} = require('lumeos_services');
const {errors} = require('lumeos_utils');

class CommunityController {

    list(req, res, next) {
        let order = null;
        if (req.query) {
            const {createdAt, name, rank} = req.query;
            if (createdAt && !name) {
                order = [['created_at', createdAt]];
            }
            if (name && !createdAt) {
                order = [['name', name]];
            }
            if (rank) {
                order = [['rank', name]];
            }
        }
        const {user_id} = req.auth;

        return community.getList({}, {order, user_id})
            .then((data) => {
                res.sendResponse(community.formatResponse(data));
            })
            .catch(next);
    }

    create(req, res, next) {
        return sequelize.transaction((transaction) => {
            Object.assign(req.body, {creator_id: req.auth.user_id});
            return community.findOne({where: {name: req.body.name}})
				.then(_community => {
					if(_community) throw errors.badRequest(`Community '${req.body.name}' already exists!`);
					return community.create(community.formatData(req.body), {transaction})
				})
                .then((communityNew) => {
                    return communityUsers.create({
                        community_id: communityNew.id,
                        user_id: req.auth.user_id
                    }, {transaction}).then(() => {
                        return communityNew;
                    });
                })
                .then((communityNew) => {
                    return UploadService
                        .upload(req.body.image, 'community')
                        .then(({file}) => {
                            if (file) {
                                return communityNew
                                    .update({image: file}, {transaction})
                                    .then((communityUpdated) => {
                                        res.sendResponse(community.formatResponse(communityUpdated));
                                    });
                            }
                            res.sendResponse(community.formatResponse(communityNew));
                        });
                });
        })
            .catch(next);
    }

    update(req, res, next) {
        const {communityId} = req.body;
        return sequelize.transaction((transaction) => {
            return community.findById(communityId)
                .then((communityEntity) => {
                    if (!communityEntity) {
                        throw errors.notFound();
                    }
                    if (req.auth.user_id !== communityEntity.creator_id) {
                        throw errors.forbidden('This community not yours');
                    }
                    let oldImage = communityEntity.image;
                    return communityEntity.update(community.formatData(req.body), {transaction})
                        .then((communityUpdated) => {
                            return UploadService
                                .upload(req.body.image, 'community')
                                .then(({file}) => {
                                    if (!file) {
                                        oldImage = null;
                                        return communityUpdated;
                                    }
                                    return communityUpdated
                                        .update({image: file}, {transaction})
                                        .then((communityUpdated) => {
                                            return communityUpdated;
                                        });
                                });
                        })
                        .then((communityUpdated) => {
                            if (!oldImage)
                                return res.sendResponse(community.formatResponse(communityUpdated));

                            return UploadS3Service
                                .delete(oldImage)
                                .then(() => {
                                    return res.sendResponse(community.formatResponse(communityUpdated));
                                });
                        });
                });
        })
            .catch(next);
    }

    async joinToCommunity(req, res, next){
    	try{

			const communityEntity = await community.findById(req.params.community_id);
			const currentUser = req.auth.user;

			if (!communityEntity) {
				throw errors.notFound('Community not exists');
			}
			if (communityEntity.creator_id === +req.auth.user_id) {
				throw errors.badRequest('You already joined');
			}

			const canUserAccessCommunity = await communitiesService.canUserAccessCommunity(currentUser, communityEntity);
			if(!canUserAccessCommunity){
				const allowedEmailsString = communityEntity.allowedDomains.join(", ");
				throw errors.forbidden(`Only users with ${allowedEmailsString} emails allowed`)
			}

			const communityUsersEntity = await communityUsers.create(
				model.formattingValue(Object.assign(req.params, req.auth), ['user', 'iat'])
			);

			if (!communityUsersEntity) {
				throw errors.badRequest();
			}

			res.sendResponse();

		}catch(e){
			next(e);
		}
	}

    unJoinFromCommunity(req, res, next) {
        return community.findById(req.params.community_id)
            .then((communityEntity) => {
                if (!communityEntity) {
                    throw errors.notFound('Community not exists');
                }
                if (communityEntity.creator_id === +req.auth.user_id) {
                    throw errors.badRequest('Can\'t unjoined because you admin');
                }
                return communityUsers.destroy({
                    where: model.formattingValue(Object.assign(req.params, req.auth), ['user', 'iat'])
                })
                    .then((communityUsersEntity) => {
                        if (!communityUsersEntity) {
                            throw errors.notFound('You unjoin from this community');
                        }
                        res.sendResponse();
                    });
            })
            .catch(next);
    }

	delete(req, res, next) {
		return community.findById(req.params.communityId)
		.then(communityEntity => {
			if (!communityEntity) {
				throw errors.notFound('Community not found');
			}
			if (communityEntity.creator_id !== req.auth.user_id) {
				throw errors.badRequest('Only creator can delete community');
			}

			return communityEntity.destroy();
		})
		.then(() => res.sendResponse())
		.catch(next);
	}

	async get(req, res, next) {
		const {user_id} = req.auth;

		try{

			const communityEntity = await community.getOne(req.params.communityId, user_id);

			if (!communityEntity) {
				throw errors.notFound('Community not found');
			}

			const canUserAccessCommunity = await communitiesService.canUserAccessCommunity(req.auth.user, communityEntity.get());

			if(!canUserAccessCommunity){
				const allowedEmailsString = communityEntity.get().allowedDomains.join(", ");
				throw errors.forbidden(`Only users with ${allowedEmailsString} emails allowed`)
			}

			res.sendResponse(communityEntity);

		}catch(e){
			next(e);
		}


	}
}

module.exports = new CommunityController();
