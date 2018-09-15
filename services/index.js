exports.UploadS3Service = require('./upload_s3_service');
exports.UploadService = require('./upload_service');

exports.PushService = require('./push_service');
exports.PollService = require('./poll_service');
exports.MailService = require('./mail_service');


exports.mailService = new exports.MailService();
// exports.uploadService = new exports.UploadService();
// exports.pushService = new PushService;
// exports.pollService = new PollService;

// exports.pollService.getNotAnswersPull().then(console.log);