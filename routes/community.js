const express = require('express');
const {auth} = require('lumeos_middlewares');
const {communityController} = require('lumeos_controllers')

const router = express.Router();

router.route('/community')
    .all(auth)
    .get(communityController.list);


module.exports = router;