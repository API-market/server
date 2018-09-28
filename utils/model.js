const format = require('lumeos_utils/format');

class ModelUtils {

    _formattingField(field) {
        if (field.constructor.name !== 'String') {
            throw new Error(`Field: ${field} must be string`);
        }
        return field.split(/(?<!^)(?=[A-Z])/).map((e, i, arr) => {
            return e.toLowerCase() + (i !== arr.length - 1 ? '_' : '');
        }).join('').replace(/_{2,}/g, '_');
    }

    formattingValue(data, exclude = [], replace = {}) {
        return Object.keys(data).reduce((init, field) => {
            if (exclude.includes(field)) {
                return init;
            }

            init[this._formattingField(field)] = parseInt(data[field]) || data[field];

            if (Object.keys(replace)) {
                Object.keys(replace).forEach((prop) => {
                    if (!data.hasOwnProperty(prop)) {
                        throw new Error(`Property: ${prop} not found`);
                    }
                    if (data[prop]) {
                        init[this._formattingField(replace[prop])] = parseInt(data[prop]) || data[prop];
                    }
                    delete init[this._formattingField(prop)];
                });
            }
            return init;
        }, {});
    }

}

module.exports = ModelUtils;