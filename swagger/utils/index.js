exports.responseFormat = (data) => {
    let result = {
        type: 'object',
        properties: data
    };
    if (typeof data.$ref !== 'undefined') {
        Object.assign(result, data);
        delete  result.properties;
    }
    if (data instanceof Array) {
        result = {
            type: 'array',
            items: data[0]
        };
    }
    console.log(JSON.stringify(result, null, 5));
    return {
        type: 'object',
        properties: {
            _v: {
                type: 'number'
            },
            data: result,
            pagination: {
                type: 'object'
            }
        }
    };
};