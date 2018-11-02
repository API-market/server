const { errors } = require('lumeos_utils');
const { userEmailsService } = require('lumeos_services');

class UserEmailsController {

    async list(req, res, next) {
        const currentUserId = req.auth.user_id;
        const userId = parseInt(req.query.userId, 10);

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

        try {

            const verify_token = await userEmailsService.generateEmailVerifyToken(userId);
            const domain = userEmailsService.getEmailAddressDomain(email);
            const createEmailParams = { email, domain, userId, type, verify_token };

            const emailEntity = await userEmailsService.create(createEmailParams);
            res.sendResponse(emailEntity)

        } catch (e) {
            next(e)
        }

    }

    async verify(req, res, next) {

        const currentUserId = req.auth.user_id;
        const emailId = req.params.emailId;

        try {

            const emailEntity = await userEmailsService.getEmailById(emailId);

            if(!emailEntity) throw errors.notFound(`Email ${emailId} not found`);
            if(emailEntity.userId !== currentUserId) throw errors.forbidden(`Can verify only your own emails`);
            if(emailEntity.verify === true) throw errors.badRequest(`Email already verified`);

            await userEmailsService.sendEmailVerifyLink(req.auth, emailEntity);

            res.status(204).json();

        } catch (e) {
            next(e)
        }

    }


}

module.exports = new UserEmailsController();
