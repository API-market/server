const {responseFormat} = require('./utils');

module.exports = {
    '/schools': {
        get: {
            tags: [
                'Schools'
            ],
            description: 'Get supported schools list',
            summary: 'Get supported schools list',
			parameters: [],
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Schools'}])
                }
            }
        },
    }
};
