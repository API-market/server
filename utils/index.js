const Events = require('./events');
const Token = require('./token');
const Model = require('./model');
const Migration = require('./migration');
const Errors = require('./errors');
const Format = require('./format');
const Joi = require('./joi');

exports.events = new Events;
exports.token = new Token;
exports.model = new Model;
exports.migration = new Migration;
exports.format = new Format;
exports.errors = Errors;
exports.joi = Joi;