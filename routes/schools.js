const express = require('express');
const {schoolsController} = require('lumeos_controllers');

const router = express.Router();

router.route('/schools').get(
	schoolsController.list,
);

module.exports = router;
