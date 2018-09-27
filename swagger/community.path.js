const community = {
    type: 'object',
    properties: {
        id: {
            type: 'number',
        },
        created_at: {
            type: 'string',
            format: 'date-time'
        },
        updated_at: {
            type: 'string',
            format: 'date-time'
        },
        polls_at: {
            type: 'string',
            format: 'date-time'
        },
        name: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        image: {
            type: 'string',
        },
        creator_id: {
            type: 'number',
        }
    }
}
module.exports = {
    '/community': {
        post: {
            tags: [
                'Community'
            ],
            summary: 'Create new community in system',
            description: 'Create new community in system',
            parameters: [
                {
                    name: 'Authorization',
                    in: 'header',
                    description: 'Auth (Authorization: Bearer XXX)',
                },
                {
                    name: 'name',
                    in: 'formData',
                    required: true,
                    description: 'Unique name community',
                    type: 'string'
                },
                {
                    name: 'description',
                    in: 'formData',
                    required: true,
                    description: 'Description for community',
                    type: 'string'
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
                    description: 'New user is created',
                    schema: {
                        allOf: [
                            {$ref: '#/definitions/Community'},
                            community
                        ]
                    }
                }
            }
        },
        get: {
            tags: [
                'Community'
            ],
            summary: 'Get all community in system',
            responses: {
                200: {
                    description: 'OK',
                    schema: {
                        allOf: [
                            {$ref: '#/definitions/Community'},
                            community
                        ]
                    }
                }
            }
        }
    },
};