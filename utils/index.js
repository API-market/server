const Events = require('./events');
const Token = require('./token');
const Model = require('./model');
const Migration = require('./migration');

exports.events = new Events;
exports.token = new Token;
exports.model = new Model;
exports.migration = new Migration;