const {responseFormat} = require('./utils');

module.exports = {
    '/community/:community_id/polls': {
        get: {
            tags: [
                'Community'
            ],
            description: 'Get polls for current group',
            summary: 'Get polls for current group',
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Polls'}])
                }
            }
        },
        post: {
            tags: [
                'Community',
            ],
            description: 'Create poll for current group',
            summary: 'Create poll for current group',
            parameters: [
                {
                    name: 'Authorization',
                    in: 'header',
                    description: 'Auth (Authorization: Bearer XXX)',
                },
                {
                    name: 'community_id',
                    in: 'path',
                    required: true,
                    description: 'ID of community that we want to find',
                    type: 'number'
                },
                {
                    name: 'question',
                    in: 'formData',
                    required: true,
                    description: 'Name for question',
                    type: 'string'
                },
                {
                    name: 'answers[]',
                    in: 'formData',
                    required: true,
                    description: 'Answers for question',
                    type: 'array'
                },
                {
                    name: 'tags[]',
                    in: 'formData',
                    required: true,
                    description: 'Tags for question',
                    type: 'array'
                },
                {
                    name: 'image',
                    in: 'formData',
                    description: 'Image for community',
                    type: 'file'
                }
            ],
            consumes: [
                'multipart/form-data'
            ],
            produces: [
                'application/json'
            ],
            responses: {
                200: {
                    description: 'List polls from community',
                    ...responseFormat({
                        $ref: '#/definitions/Polls'
                    })
                }
            }
        },
    },
    '/community/:community_id/polls/:poll_id/results': {
        get: {
            tags: [
                'Community'
            ],
            description: 'Get poll result in community',
            summary: 'Get poll result in community',
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat({$ref: '#/definitions/CommunityPollResult'})
                }
            }
        },
    }
};