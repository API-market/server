const { userEmail } = require('lumeos_models');

class UserEmailsService {


	static async getEmailsByUserId(userId){
		const emailsEntities = await userEmail.findAll({
			where: { userId }
		}) || [];

		return emailsEntities.map(emailsEntity => emailsEntity.get());
	}

    static async getEmailById(emailId){
		return await userEmail.findById(emailId);
    }

    static async create(createEmailParams){
        return await userEmail.create(createEmailParams);
    }

    static async generateEmailVerifyToken(userId){

        const { token } = require('lumeos_utils');

        return token.generate({
            user_id: userId,
            verify: false,
            iat: Math.floor(new Date() / 1000)
        }, { expiresIn: 0 });

	}

	static async sendEmailVerifyLink(user, email){

		const { mailService } = require('lumeos_services');

        return mailService.send(email.email, mailService.constants.VERIFY_USER, {
            link: `/app/?verifyToken=${email.verify_token}`,
            username: `${user.firstName} ${user.lastName}`,
        })
	}

}

module.exports = UserEmailsService;
