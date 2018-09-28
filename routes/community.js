const express = require('express');
const {auth} = require('lumeos_middlewares');
const {UploadService} = require('lumeos_services');
const {communityController, communityPollsController} = require('lumeos_controllers');
const {communityValidate, communityPollsValidate} = require('../controllers/validateSchemas');

const router = express.Router();

router.route('/community/:community_id/polls/:poll_id?')
    .all(auth)
    .get(communityPollsValidate.list, communityPollsController.list)
    .post([UploadService.middleware('image'), communityPollsValidate.create], communityPollsController.create)
    .put([UploadService.middleware('image'), communityPollsValidate.update], communityPollsController.update);

router.route('/community/:id?')
    .all(auth)
    .get(communityValidate.list, communityController.list)
    .post([UploadService.middleware('image'), communityValidate.create], communityController.create)
    .put([UploadService.middleware('image'), communityValidate.update], communityController.update);

router.route('/community/:community_id/join')
    .all(auth)
    .post(communityValidate.joinFromCommunity, communityController.joinToCommunity);

router.route('/community/:community_id/unjoin')
    .all(auth)
    .post(communityValidate.unJoinFromCommunity, communityController.unJoinFromCommunity);


module.exports = router;