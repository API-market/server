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

const express = require('express');
const app = express();
const cors = require('cors');

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var jwt = require('jsonwebtoken');

serverInfo = require("./server_info.js");
const VERSION = serverInfo.VERSION;
const PORT = serverInfo.PORT;
const SUPER_SECRET_JWT_KEY = serverInfo.SUPER_SECRET_JWT_KEY;
const SEED_AUTH = serverInfo.SEED_AUTH;

const dbSetup = require("./db_setup.js");
const sequelize = dbSetup.dbInstance;

const db_entities = require("./db_entities.js");
const User = db_entities.User;

// seed admin user
sequelize.sync().then(() => {
  User.findOne({where: {email: "admin@lumeos.io"}}).then(user => {
    if (user) {
      console.log("User with id " + user["id"] + " already exists")
    } else {
      User.create({
        "email": "admin@lumeos.io",
        "password": SEED_AUTH
      }).then(user => {
        console.log("seeded with user with id " + user["id"])
      })
        .catch(error => {
          console.log("Error seeding:");
          console.log(error);
        })
    }
  })
});

app.use(function (req, res, next) {
  if (req.url.endsWith("/login")
    || req.url.endsWith("/login/")
    || req.url.endsWith("/faqs")
    || req.url.endsWith("/faqs/")) {
    next()
  } else {
    var token = req.headers.authorization.split(" ")[1];
    if (token) {
      try {
        var decoded = jwt.verify(token, SUPER_SECRET_JWT_KEY);
        next()
      } catch (err) {
        console.log(err);
        res.status(401).json({message: "Unauthorized: JWT token not provided"});
      }
    } else {
      res.status(401).json({message: "Unauthorized: JWT token not provided"});
    }
  }
});

basicRoutes = require("./basic_routes.js");
userRoutes = require("./user_routes.js");
pollRoutes = require("./poll_routes.js");

app.use('/v' + VERSION, basicRoutes);
app.use('/v' + VERSION, userRoutes);
app.use('/v' + VERSION, pollRoutes);

const server = app.listen(PORT);
console.log('listening on port ' + PORT);

module.exports = server;
