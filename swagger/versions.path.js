const {responseFormat} = require('./utils');

module.exports = {
    '/versions/{version}': {
        get: {
            tags: [
                'Versions'
            ],
            description: 'Get if specified version supported by API',
            summary: 'Get if specified version supported by API',
			parameters: [
				{
					name: 'version',
					in: 'path',
					required: true,
					description: 'Semver string',
					type: 'string'
				},
			],
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Versions'}])
                }
            }
        },
    }
};
