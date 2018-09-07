const PushService = require('./push_service');
const PollService = require('./poll_service');

exports.pushService = new PushService;
exports.pollService = new PollService;

// exports.pollService.getNotAnswersPull().then(console.log);