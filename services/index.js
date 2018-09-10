exports.PushService = require('./push_service');
exports.PollService = require('./poll_service');
exports.MailService = require('./mail_service');

exports.mailService = new exports.MailService();
// exports.pushService = new PushService;
// exports.pollService = new PollService;

// exports.pollService.getNotAnswersPull().then(console.log);