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
const {basicAuth} = require('lumeos_middlewares')
const bodyParser = require('body-parser');
const {join} = require('path');
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(cors());

var jwt = require('jsonwebtoken');

serverInfo = require("./server_info.js");
const VERSION = serverInfo.VERSION;
const PORT = serverInfo.PORT;
const SUPER_SECRET_JWT_KEY = serverInfo.SUPER_SECRET_JWT_KEY;

const stdin = process.openStdin();
stdin.addListener("data", function(d) {
    switch (d.toString().trim()) {
        case "run-seed": {
            // seed admin user
            require('./seed');
        }
    }
});

if(!process.env.LUMEOS_SERVER_DB) {
    require('./seed');
}

app.use('/v' + VERSION, function (req, res, next) {
  if (req.url.endsWith("/login")
    || (req.url.match(/\/users\/?$/) && ['post'].includes(req.method.toLowerCase()))
    || (req.url.match(/\/users\/forgot\/?$/) && ['post', 'put'].includes(req.method.toLowerCase()))
    || req.url.match(/\/app/)
    || req.url.match(/\/send\/all\/notification/)
    || req.url.match(/\/push/)
    || req.url.endsWith("/login/")
    || req.url.endsWith("/faqs")
    || req.url.endsWith("/faqs/")) {
    next()
  } else {
      try {
          const token = req.headers.authorization.split(' ')[1];
          req.auth = jwt.verify(token, SUPER_SECRET_JWT_KEY);
          next();
      } catch (err) {
          res.status(401).json({message: 'Unauthorized: JWT token not provided'});
      }
  }
});

// TODO import model model instead db_entity
// const Models = require('./models');
// console.log(Models.users, '<<<');
// Models.users.create({
//     lastName: 'Admin',
//     firstName: 'Admin',
//     email: 'admin@lumeos.io',
//     password: 'SEED_AUTH',
// }).then(console.log).catch(console.log)

basicRoutes = require("./basic_routes.js");
userRoutes = require("./user_routes.js");
pollRoutes = require("./poll_routes.js");
notificationsRoutes = require("./notifications_routes");

app.use('/app', (req, res) => {
    if (req._parsedUrl.search) {
        let protocol = 'lumeos:';
        if (!req.headers['user-agent'].match(/mobile/i)) {
            protocol = ''
        }
        return res.redirect(`${protocol}//${req._parsedUrl.search}`);
    }
    res.end();
})
app.use('/v' + VERSION, basicRoutes);
app.use('/v' + VERSION, userRoutes);
app.use('/v' + VERSION, pollRoutes);
app.use('/v' + VERSION, notificationsRoutes);

/**
 * Web notifications
 */

app.engine('ejs', require('ejs-locals'));
app.set('view engine', 'ejs');
app.use(express.static(join(__dirname, 'views/assets')));
app.set('views', `${__dirname}/views`);
// main variable for web
app.use(function (req, res, next) {
    res.locals._layoutFile = true;
    res.locals.utils = {
        active: (url, className = 'active') => {
            return req.originalUrl === url ? className : ''
        }
    };
    next()
});
app.use(process.env.ADMIN_ROUTER, require('./routes/web'));

/**
 * Cron
 */
require('./crons');

const server = app.listen(PORT);
console.log('listening on port ' + PORT);

module.exports = server;
