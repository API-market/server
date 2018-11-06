const express = require('express');
const {auth} = require('lumeos_middlewares');
const {userEmailsController} = require('lumeos_controllers');
const {userEmailsValidator} = require('lumeos_validators');

const router = express.Router();

router.route('/emails/').get(
	auth,
	userEmailsValidator.list,
	userEmailsController.list,
);

router.route('/emails').post(
	auth,
	userEmailsValidator.create,
	userEmailsController.create,
);

router.route('/emails/:emailId').put(
	auth,
	userEmailsValidator.update,
	userEmailsController.update,
);

router.route('/emails/:emailId').delete(
	auth,
	userEmailsValidator.delete,
	userEmailsController.delete,
);

router.route('/emails/:emailId/verify').post(
    auth,
    userEmailsValidator.verify,
    userEmailsController.verify,
);

module.exports = router;
