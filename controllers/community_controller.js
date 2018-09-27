const {community, users, profileImages, countParticipantView, communityUsers, sequelize} = require('lumeos_models');
const {UploadS3Service} = require('lumeos_services');

class CommunityController {

    list(req, res, next) {
        let order = [];
        if (req.query) {
            const {createdAt, name} = req.query;
            if (createdAt) {
                order.push(['created_at', createdAt]);
            }
            if (name) {
                order.push(['name', name]);
            }
        }

        return community.findAll({
            attributes: Object.keys(community.attributes).filter(e => e !== 'creator_id'),
            include: [{
                model: users,
                include: [{
                    model: profileImages,
                    attributes: ['image']
                }],
                attributes: ['id', 'firstName', 'lastName']
            }, {
                model: countParticipantView,
                as: 'members',
                attributes: ['count']
            }],
            order
        })
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
                            return communityNew
                                .update({image: file}, {transaction})
                                .then((communityUpdated) => {
                                    res.sendResponse(community.formatResponse(communityUpdated));
                                });
                        });
                });
        })
            .catch(next);
    }

    update(req, res, next) {
        return sequelize.transaction((transaction) => {
            return community.update(community.formatData(req.body), {transaction})
                .then((communityUpdated) => {
                    return UploadS3Service
                        .upload(req.body.image, 'community')
                        .then(({file}) => {
                            return communityUpdated
                                .update({image: file}, {transaction})
                                .then((communityUpdated) => {
                                    return Object.assign(communityUpdated, {
                                        old_image: communityUpdated._previousDataValues.image
                                    });
                                });
                        });
                })
                .then((communityUpdated) => {
                    return UploadS3Service
                        .delete(communityUpdated.old_image)
                        .then(() => {
                            return res.sendResponse(community.formatResponse(communityUpdated));
                        });
                });
        })
            .catch(next);
    }
}

module.exports = new CommunityController();