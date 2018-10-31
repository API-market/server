const { userEmail } = require('lumeos_models');

class UserEmailsService {


	static async getEmailsByUserId(userId){
		const emailsEntities = await userEmail.findAll({
			where: { userId }
		}) || [];

		return emailsEntities.map(emailsEntity => emailsEntity.get());
	}

    static async create(createEmailParams){
        return await userEmail.create(createEmailParams);
    }

}

module.exports = UserEmailsService;
