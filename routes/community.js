const express = require('express');
const {auth} = require('lumeos_middlewares');
const {UploadService} = require('lumeos_services');
const {communityController, communityPollsController, communityPollAnswersController} = require('lumeos_controllers');
const {communityValidate, communityPollsValidate, communityPollAnswersValidate} = require('../controllers/validateSchemas');

const router = express.Router();

/**
 * Create and control community
 */
router.route('/community')
    .all(auth)
    .get(communityValidate.list, communityController.list)
    .post([UploadService.middleware('image'), communityValidate.create], communityController.create)
    .put([UploadService.middleware('image'), communityValidate.update], communityController.update);

router.route('/community/:communityId')
	.all(auth)
	.delete(communityValidate.delete, communityController.delete)
	.get(communityValidate.get, communityController.get);

router.route('/community/:community_id/join')
    .all(auth)
    .post(communityValidate.joinFromCommunity, communityController.joinToCommunity);

router.route('/community/:community_id/unjoin')
    .all(auth)
    .post(communityValidate.unJoinFromCommunity, communityController.unJoinFromCommunity);

/**
 * Create the polls in community
 */
router.route('/community/:community_id/polls/:poll_id?')
    .all(auth)
    .get(communityPollsValidate.list, communityPollsController.list)
    .post([UploadService.middleware('image'), communityPollsValidate.create], communityPollsController.create)
    .put([UploadService.middleware('image'), communityPollsValidate.update], communityPollsController.update);

/**
 * Answer the question
 */
router.route('/community/:community_id/polls/:poll_id/answers')
    .all(auth)
    .get(communityPollAnswersController.result)
    .post([communityPollAnswersValidate.create], communityPollAnswersController.create);


module.exports = router;
