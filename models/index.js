'use strict';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const modelPath = path.join(__dirname, file);
    const model = sequelize.import(modelPath);
    exports[model.name] = db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  if (db[modelName].formatter) {
    db[modelName].formatter(db, _);
  }
  if (db[modelName].methods) {
      /**
       * @param db Sequelize
       * @param _ lodash
       */
    db[modelName].methods(db, _, sequelize);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
