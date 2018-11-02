const {responseFormat} = require('./utils');

module.exports = {
    '/emails': {
        get: {
            tags: [
                'Emails'
            ],
            description: 'Get list of additional user`s emails',
            summary: 'Get list of additional user`s emails',
            parameters: [
                {
                    name: 'Authorization',
                    in: 'header',
                    description: 'Auth (Authorization: Bearer XXX)',
                },
                {
                    name: 'userId',
                    in: 'query',
                    required: true,
                    description: 'User id',
                    type: 'number'
                },
            ],
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Email'}])
                }
            }
        },

        post: {
            tags: [
                'Emails'
            ],
            description: 'Add email for current user',
            summary: 'Add email for current user',
            parameters: [
                {
                    name: 'Authorization',
                    in: 'header',
                    description: 'Auth (Authorization: Bearer XXX)',
                },
                {
                    name: 'name',
                    in: 'formData',
                    required: false,
                    description: '',
                    type: 'string'
                },
                {
                    name: 'email',
                    in: 'formData',
                    required: true,
                    description: '',
                    type: 'string'
                },
                {
                    name: 'type',
                    in: 'formData',
                    required: true,
                    description: '',
                    type: 'string'
                },
            ],
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Email'}])
                }
            }
        },
    },
    '/emails/{emailId}/verify': {

        post: {
            tags: [
                'Emails'
            ],
            description: 'Send link for email verifications to user',
            summary: 'Send link for email verifications to user',
            parameters: [
                {
                    name: 'Authorization',
                    in: 'header',
                    description: 'Auth (Authorization: Bearer XXX)',
                },
                {
                    name: 'emailId',
                    in: 'path',
                    required: true,
                    description: '',
                    type: 'string'
                },

            ],
            responses: {
                200: {
                    description: 'OK',
                    ...responseFormat([{$ref: '#/definitions/Email'}])
                }
            }
        },
    }
};
