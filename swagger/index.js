const {readdirSync} = require('fs');
require('dotenv').config({path: `${__dirname}/../.env`});

const {paths, definitions} = readdirSync(__dirname).reduce((init, file) => {
    file.includes('.path.js') && Object.assign(init.paths, require(`${__dirname}/${file}`));
    file.includes('.definition.js') && Object.assign(init.definitions, require(`${__dirname}/${file}`));
    return init;
}, {paths: {}, definitions: {}});

module.exports = Object.assign(require('./config'), {
    paths,
    definitions
});