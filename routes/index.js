const express = require('express');
const {basicAuth} = require('lumeos_middlewares');
const community = require('./community');

const router = express.Router();

router.use('/v1', community);

module.exports = router;