const express = require('express');
const notificationsRouter = require('./notifications');
const homeRouter = require('./home');
const {basicAuth} = require('lumeos_middlewares');

const router = express.Router();

// router.
router.use(basicAuth.init);
router.use(homeRouter);
router.use(notificationsRouter);

module.exports = router;