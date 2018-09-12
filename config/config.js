module.exports = {
    development: {
        username: process.env.LUMEOS_SERVER_DB_USERNAME,
        password: process.env.LUMEOS_SERVER_DB_PASSWORD,
        database: process.env.LUMEOS_SERVER_DB,
        host: process.env.LUMEOS_SERVER_DB_HOST || '127.0.0.1',
        dialect: process.env.LUMEOS_SERVER_DB_DIALECT || 'postgres'
    },
    test: {
        username: process.env.LUMEOS_SERVER_DB_USERNAME,
        password: process.env.LUMEOS_SERVER_DB_PASSWORD,
        database: '127.0.0.1',
        host: process.env.LUMEOS_SERVER_DB_HOST || '127.0.0.1',
        dialect: process.env.LUMEOS_SERVER_DB_DIALECT || 'sqlite'
    },
    production: {
        username: process.env.LUMEOS_SERVER_DB_USERNAME,
        password: process.env.LUMEOS_SERVER_DB_PASSWORD,
        database: process.env.LUMEOS_SERVER_DB,
        host: process.env.LUMEOS_SERVER_DB_HOST || '127.0.0.1',
        dialect: process.env.LUMEOS_SERVER_DB_DIALECT || 'postgres'
    }
};
