module.exports = {
    Community: {
        required: [
            'name',
            'description'
        ],
        properties: {
            name: {
                type: 'string',
                uniqueItems: true
            },
            description: {
                type: 'string',
            },
            image: {
                type: 'file'
            }
        }
    }
};