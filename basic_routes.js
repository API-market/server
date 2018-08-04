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

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'team@lumeos.io',
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

  var mailOptions = {
    from: 'team@lumeos.io',
    to: 'team@lumeos.io',
    subject: 'Server: Contact Us!',
    text: req.body['message']
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  res.status(204).json();
});


basicRouter.get('/faqs', function (req, res) {
  var contents = fs.readFileSync('faq.json', 'utf8');
  res.set('Content-Type', 'application/json').status(200).send(contents);
});


module.exports = basicRouter;
