//
//  Copyright (c) 2018, Respective Authors all rights reserved.
//
//  The MIT License
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to
//  deal in the Software without restriction, including without limitation the
//  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
//  sell copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
//  IN THE SOFTWARE.
//

var fs = require('fs');
const express = require('express');
const {check, validationResult} = require('express-validator/check');
const nodemailer = require('nodemailer');
const {PushService} = require('lumeos_services');
const pushService = new PushService();
console.log();

const db_entities = require("./db_entities.js");
const User = db_entities.User;

var transporter = nodemailer.createTransport({
  service: process.env.LUMEOS_EMAIL_SERVICE,
  auth: {
    user: process.env.LUMEOS_EMAIL_SENDER,
    pass: process.env.LUMEOS_EMAIL_PASSWORD,
  }
});
var basicRouter = express.Router();

// This is very weird end point, ideally client should just send an email, but long story
basicRouter.post('/contact_us', [
  check("user_id").isInt().withMessage("Field 'user_id' must be an int."),
  check("message").not().isEmpty().trim().escape().withMessage("Field 'message' cannot be empty"),

], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const userId = req.body["user_id"];
  User.findById(userId, {
    attributes: ["firstName", "email"]
  }).then(user => {
      var mailOptions = {
        from: process.env.LUMEOS_EMAIL_SENDER,
        to: 'team@lumeos.io',
        subject: 'Server: Contact Us!, email: ' + user["email"] + ", firstName: " + user["firstName"],
        text: req.body['message']
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
      });

  });

  res.status(204).json();
});


basicRouter.get('/faqs', function (req, res) {
  var contents = fs.readFileSync('faq.json', 'utf8');
  res.set('Content-Type', 'application/json').status(200).send(contents);
});

/**
 * Send push ont mobile for testing
 */
basicRouter.get('/send/push', function (req, res) {
    if (req.query.token && req.query.method) {
        const token = req.query.token;
        const mathod = req.query.method;
        switch (mathod) {
            case 'event:create-answer-for-poll': {
                return pushService.sendPolls(token, {nickname: 'Test test'}).then(() => {
                    return res.status(200).json({ok: true});
                }).catch((err) => {
                    return res.status(500).json({message: err.message});
                });
            }
            case 'event:send-result-for-poll': {
                return pushService.sendPollsResult(token, {nickname: 'Test test'}).then(() => {
                    return res.status(200).json({ok: true});
                }).catch((err) => {
                    return res.status(500).json({message: err.message});
                });
            }
            case 'event:send-followee-from-follower': {
                return pushService.sendFollow(token, {nickname: 'Test test'}).then(() => {
                    return res.status(200).json({ok: true});
                }).catch((err) => {
                    return res.status(500).json({message: err.message});
                });
            }
            default: {
                return res.status(404).json({error: 'Not Found', message: 'Method not found.'});
            }
        }
    }
    res.status(404).json({error: 'Not Found', message: 'Send params.'});
});


module.exports = basicRouter;
