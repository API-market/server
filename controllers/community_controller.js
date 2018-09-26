const {community, users, profileImages, countParticipantView} = require('lumeos_models');

class CommunityController {

    list(req, res, next) {
        let order = [];
        if (req.query) {
            const {createdAt, name} = req.query;
            if (createdAt) {
                order.push(['created_at', createdAt])
            }
            if (name) {
                order.push(['name', name])
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
                res.sendResponse(data);
            }).catch(next)
    }
}

module.exports = new CommunityController();