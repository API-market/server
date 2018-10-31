const express = require('express');
const {auth} = require('lumeos_middlewares');
const {userEmailsController} = require('lumeos_controllers');
const {userEmailsValidator} = require('lumeos_validators');

const router = express.Router();

router.route('/emails/:userId').get(
	auth,
	userEmailsValidator.list,
	userEmailsController.list,
);

router.route('/emails').post(
	auth,
	userEmailsValidator.create,
	userEmailsController.create,
);


module.exports = router;
