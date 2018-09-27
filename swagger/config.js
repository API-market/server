module.exports = {
    swagger: '2.0',
    info: {
        version: '1.0.1',
        title: 'Lumeos Service',
        description: 'This is documentation for API [http://swagger.io](http://swagger.io)' +
        '\n[example_swagger.json](https://petstore.swagger.io/v2/swagger.json)',
    },
    host: process.env.HOST || 'localhost:8081',
    basePath: '/v1',
    tags: [
        {
            name: 'Community',
            description: 'API for community in the system'
        }
    ],
    securityDefinitions: {
        Bearer: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization'
        }
    },
    schemes: [
        'http',
        'https',
    ],
    consumes: [
        'application/json'
    ],
    produces: [
        'application/json'
    ],
}