require('dotenv').config();
require('../server');

process.on('SIGINT', () => {
    process.kill(process.pid);
});