const express = require('express');
const app = express();
const cors = require('cors');
const {responseFormatter, basicAuth} = require('lumeos_middlewares');
const bodyParser = require('body-parser');
const {join} = require('path');
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(cors());

const jwt = require('jsonwebtoken');

serverInfo = require("./server_info.js");
const VERSION = serverInfo.VERSION;
const PORT = serverInfo.PORT;
const SUPER_SECRET_JWT_KEY = serverInfo.SUPER_SECRET_JWT_KEY;

if(!process.env.LUMEOS_SERVER_DB) {
    require('./seed');
}
app.use(responseFormatter.init);
app.use('/v' + VERSION, function (req, res, next) {
  if (req.url.endsWith("/login")
    || (req.url.match(/\/users\/?$/) && ['post'].includes(req.method.toLowerCase()))
    || (req.url.match(/\/users\/forgot\/?$/) && ['post'].includes(req.method.toLowerCase()))
    || (req.url.match(/\/users\/forgot\/verify\/?$/) && ['post'].includes(req.method.toLowerCase()))
    || req.url.match(/\/app/)
    || req.url.match(/\/send\/all\/notification/)
    || req.url.match(/\/push/)
    || req.url.match(/\/versions/)
    || req.url.match(/\/schools/)
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


basicRoutes = require("./basic_routes.js");
userRoutes = require("./user_routes.js");
pollRoutes = require("./poll_routes.js");
notificationsRoutes = require("./notifications_routes");

app.use('/app', (req, res) => {

	const device = require('device')(req.headers['user-agent']);
	const isMobile = device.is('tablet') || device.is('phone');

    if (req._parsedUrl.search && isMobile) {
        return res.redirect(`lumeos://${req._parsedUrl.search}`);
    }else{
		res.send(`Sorry, the link you clicked can only be opened from your mobile phone. Please go to your mobile phone and open the email we sent you and try the link again.`);
	}

});
app.use('/v' + VERSION, basicRoutes);
app.use('/v' + VERSION, userRoutes);
app.use('/v' + VERSION, pollRoutes);
app.use('/v' + VERSION, notificationsRoutes);
app.use(require('./routes'));

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

const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', basicAuth.init, swaggerUi.serve, swaggerUi.setup(require('./swagger')));

app.use(responseFormatter.error404);
app.use(responseFormatter.errors);

/**
 * Cron
 */
require('./crons');

const server = app.listen(PORT);
console.log('listening on port ' + PORT);

module.exports = server;
