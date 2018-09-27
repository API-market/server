const express = require('express');
const {auth} = require('lumeos_middlewares');
const {UploadService} = require('lumeos_services');
const {communityController} = require('lumeos_controllers');
const {communityValidate} = require('../controllers/validateSchemas');

const router = express.Router();

router.route('/community/:id?')
    .all(auth)
    .get(communityController.list)
    .post([UploadService.middleware('image'), communityValidate.create], communityController.create)
    .put([UploadService.middleware('image'), communityValidate.update], communityController.update);

router.route('/community/:id/join')
    .all(auth)
    .post(communityValidate.joinFromCommunity, communityController.joinToCommunity);

router.route('/community/:id/unjoin')
    .all(auth)
    .post(communityValidate.unJoinFromCommunity, communityController.unJoinFromCommunity);


module.exports = router;