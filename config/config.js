require('dotenv').config();

module.exports = {
    development: {
        username: process.env.LUMEOS_SERVER_DB_USERNAME,
        password: process.env.LUMEOS_SERVER_DB_PASSWORD,
        database: process.env.LUMEOS_SERVER_DB,
        host: process.env.LUMEOS_SERVER_DB_HOST || '127.0.0.1',
        dialect: process.env.LUMEOS_SERVER_DB_DIALECT || 'postgres',
        migrationStorageTableName: "sequelize_migrations",
        logging: process.env.DB_LOGGER || true,
    },
    test: {
        username: process.env.LUMEOS_SERVER_DB_USERNAME,
        password: process.env.LUMEOS_SERVER_DB_PASSWORD,
        database: process.env.LUMEOS_SERVER_DB,
        host: process.env.LUMEOS_SERVER_DB_HOST || '127.0.0.1',
        dialect: process.env.LUMEOS_SERVER_DB_DIALECT || 'sqlite',
        migrationStorageTableName: "sequelize_migrations",
        logging: () => {},
    },
    production: {
        username: process.env.LUMEOS_SERVER_DB_USERNAME,
        password: process.env.LUMEOS_SERVER_DB_PASSWORD,
        database: process.env.LUMEOS_SERVER_DB,
        host: process.env.LUMEOS_SERVER_DB_HOST || '127.0.0.1',
        dialect: process.env.LUMEOS_SERVER_DB_DIALECT || 'postgres',
        migrationStorageTableName: "sequelize_migrations",
        logging: process.env.DB_LOGGER || true,
    }
};
