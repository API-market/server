const { communityPolls, pollAnswers } = require('lumeos_models');

class CommunityPollService {

	static async getPollByCommunityIdByPollId(community_id, id) {
		return communityPolls.getOne({
			where: {
				community_id,
				id,
			}
		}, {});
	}

	static async getPollIsAnswered(communityId, pollId, userId){
		const poll = await this.getPollByCommunityIdByPollId(communityId, pollId);
		const userAnswersCount = await pollAnswers.count({
			where: {
				user_id: userId,
				poll_id: pollId,
			},
		});

		poll[`dataValues`][`is_answered`] = userAnswersCount;

		return poll;
	}

	static async getPollIsBought(communityId, pollId, userId){
		const poll = await this.getPollByCommunityIdByPollId(communityId, pollId);
		poll[`dataValues`][`is_bought`] = 1;
		return poll;
	}
}

module.exports = CommunityPollService;
