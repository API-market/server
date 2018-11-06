const express = require('express');

const community = require('./community');
const versions = require('./versions');
const schools = require('./schools');
const images = require('./images');
const emails = require('./emails');

const router = express.Router();

router.use('/v1', community);
router.use('/v1', versions);
router.use('/v1', schools);
router.use('/v1', images);
router.use('/v1', emails);

module.exports = router;
