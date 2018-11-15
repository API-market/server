const { userEmailsService } = require('lumeos_services');

class CommunitiesService {

	static async canUserAccessCommunity(user, community){

		const allowedDomains = community.allowedDomains || [];
		if( !community.allowedDomains ){
			return true;
		}

		const userEmailDomain = userEmailsService.getEmailAddressDomain(user.email);
		const userEmails = await userEmailsService.getEmailsByUserId(user.id);

		if( CommunitiesService.isDomainAllowed(userEmailDomain, allowedDomains) )
			return true;

		const allowedUserEmailDomains = userEmails
			  .filter(email => email.verify)
			  .map(email => email.domain)
			  .filter(domain => CommunitiesService.isDomainAllowed(domain, allowedDomains))
		;

		return ( allowedUserEmailDomains.length > 0 )

	}

	static isDomainAllowed(domain, allowedDomains){
		if(allowedDomains.indexOf(domain) >= 0)
			return true;
		}

}

module.exports = CommunitiesService;
