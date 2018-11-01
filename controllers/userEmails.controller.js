const { errors } = require('lumeos_utils');
const { userEmailsService } = require('lumeos_services');

class UserEmailsController {

    async list(req, res, next) {
        const currentUserId = req.auth.user_id;
        const userId = req.params.userId;

        try {

            if (currentUserId !== userId) throw errors.forbidden('Can view only your own emails');

            const emails = await userEmailsService.getEmailsByUserId(userId);
            res.sendResponse(emails)

        } catch (e) {
            next(e)
        }
    }

    async create(req, res, next) {
        const userId = req.auth.user_id;

        const { type, email } = req.body;
        const createEmailParams = { email, userId, type };

        try {

            const emailEntity = await userEmailsService.create(createEmailParams);
            res.sendResponse(emailEntity)

        } catch (e) {
            next(e)
        }

    }


}

module.exports = new UserEmailsController();
