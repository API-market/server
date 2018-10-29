const {responseFormat} = require('./utils');

module.exports = {
    '/images': {
        get: {
            tags: [
                'Images'
            ],
            description: 'Get images list',
            summary: 'Get images list',
			parameters: [],
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Image'}])
                }
            }
        },
		post: {
			tags: [
				'Images'
			],
			description: 'Add image',
			summary: 'Add image',
			parameters: [],
			responses: {
				200: {
					description: 'OK',
					...responseFormat([{$ref: '#/definitions/Image'}])
				}
			}
		},
    },

    '/images/{imageId}': {
        get: {
            tags: [
                'Images'
            ],
            description: 'Get single image by id',
            summary: 'Get single image by id',
			parameters: [],
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Image'}])
                }
            }
        },
        put: {
            tags: [
                'Images'
            ],
            description: 'Update image',
            summary: 'Update image',
			parameters: [],
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Image'}])
                }
            }
        },
        'delete': {
            tags: [
                'Images'
            ],
            description: 'Delete image',
            summary: 'Delete image',
			parameters: [],
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Image'}])
                }
            }
        },
    }
};
