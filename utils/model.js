
class Model {

    _formattingField(field) {
        return field.split(/(?<!^)(?=[A-Z])/).map((e, i, arr) => {
            return e.toLowerCase() + (i !== arr.length-1 ? '_' : '')
        }).join('').replace(/_{2,}/g, '_')
    }

    formattingValue(data, exclude = []) {
        return Object.keys(data).reduce((init, field) => {
            if (exclude.includes(field)) {
                init[field] = data[field];
                return init;
            }
            init[this._formattingField(field)] = data[field];
            return init;
        }, {})
    }
}

module.exports = Model;