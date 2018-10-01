module.exports = {
    Polls: {
        type: 'object',
        properties: {
            image: {
                type: 'string'
            },
            answers: {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            tags:{
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            id: {
                type: 'number'
            },
            created_at: {
                type: 'string'
            },
            question: {
                type: 'string'
            },
            price: {
                type: 'number'
            },
            creator_id: {
                type: 'number'
            }
        }
    }
};