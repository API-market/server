const express = require('express');
const {versionsController} = require('lumeos_controllers');
const {versionsValidator} = require('lumeos_validators');

const router = express.Router();

router.route('/versions/:version').get(
	// versionsValidator.get,
	versionsController.get,
);


module.exports = router;
