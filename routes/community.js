const express = require('express');
const {auth} = require('lumeos_middlewares');
const {UploadService} = require('lumeos_services');
const {communityController} = require('lumeos_controllers');
const {communityValidate} = require('../controllers/validateSchemas');

const router = express.Router();

router.route('/community')
    .all(auth)
    .get(communityController.list)
    .post([UploadService.middleware('image'), communityValidate.create], communityController.create)
    .put([UploadService.middleware('image'), communityValidate.update], communityController.update);


module.exports = router;