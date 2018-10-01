const {responseFormat} = require('./utils')

module.exports = {
    '/community/:community_id/polls/:poll_id/answers': {
        get: {
            tags: [
                'Community'
            ],
            description: 'Get answers for current poll in the community',
            summary: 'Get answers for current poll in the community',
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
                    name: 'poll_id',
                    in: 'path',
                    required: true,
                    description: 'ID of poll in the community that we want to find',
                    type: 'number'
                }
            ],
            produces: [
                'application/json'
            ],
            responses: {
                200: {
                    description: 'Get result by polls',
                    ...responseFormat([
                        {$ref: '#/definitions/AnswersResult'}
                    ])
                }
            }
        },
        post: {
            tags: [
                'Community'
            ],
            description: 'Create answer for current poll in the community',
            summary: 'Create answer for current poll in the community',
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
                    name: 'poll_id',
                    in: 'path',
                    required: true,
                    description: 'ID of poll in the community that we want to find',
                    type: 'number'
                },
                {
                    name: 'answer',
                    in: 'fromData',
                    required: true,
                    description: 'Answer for current poll',
                    type: 'number'
                }
            ],
            produces: [
                'application/json'
            ],
            responses: {
                200: {
                    description: 'Get result by answers',
                }
            }
        },
    }
};