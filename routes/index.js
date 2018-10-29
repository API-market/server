const express = require('express');
const {basicAuth} = require('lumeos_middlewares');
const community = require('./community');
const versions = require('./versions');
const schools = require('./schools');
const images = require('./images');

const router = express.Router();

router.use('/v1', community);
router.use('/v1', versions);
router.use('/v1', schools);
router.use('/v1', images);

module.exports = router;
