exports.UploadS3Service = require('./upload_s3_service');
exports.UploadService = require('./upload_service');

exports.PushService = require('./push_service');
exports.PollService = require('./poll_service');
exports.MailService = require('./mail_service');
exports.MessageService = require('./message_service');

exports.mailService = new exports.MailService();