const {community, users, profileImages, countParticipantView, communityCountAnswersView , communityUsers, sequelize} = require('lumeos_models');
const {model} = require('lumeos_utils');
const {UploadS3Service} = require('lumeos_services');
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

        return community.getList({}, {order})
            .then((data) => {
                res.sendResponse(community.formatResponse(data));
            })
            .catch(next);
    }

    create(req, res, next) {
        return sequelize.transaction((transaction) => {
            Object.assign(req.body, {creator_id: req.auth.user_id});
            return community.create(community.formatData(req.body), {transaction})
                .then((communityNew) => {
                    return communityUsers.create({
                        community_id: communityNew.id,
                        user_id: req.auth.user_id
                    }, {transaction}).then(() => {
                        return communityNew;
                    });
                })
                .then((communityNew) => {
                    return UploadS3Service
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
        return sequelize.transaction((transaction) => {
            return community.findById(req.body.id)
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
                            return UploadS3Service
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

    joinToCommunity(req, res, next) {
        return community.findById(req.params.community_id)
            .then((communityEntity) => {
                if (!communityEntity) {
                    throw errors.notFound('Community not exists');
                }
                if (communityEntity.creator_id === +req.auth.user_id) {
                    throw errors.bedRequest('You already joined');
                }
                return communityUsers.create(model.formattingValue(Object.assign(req.params, req.auth), ['user', 'iat'], {id: 'community_id'}))
                    .then((communityUsersEntity) => {
                        if (!communityUsersEntity) {
                            throw errors.bedRequest();
                        }
                        res.sendResponse();
                    });
            })
            .catch(next);
    }

    unJoinFromCommunity(req, res, next) {
        return community.findById(req.params.community_id)
            .then((communityEntity) => {
                if (!communityEntity) {
                    throw errors.notFound('Community not exists');
                }
                if (communityEntity.creator_id === +req.auth.user_id) {
                    throw errors.bedRequest('Can\'t unjoined because you admin');
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
}

module.exports = new CommunityController();