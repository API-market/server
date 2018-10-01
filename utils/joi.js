const Joi = require('joi');

class JoiUtils {

    mergeSchema(schemas) {
        let mergedSchema = Joi.object();
        schemas.forEach(schema => {
            mergedSchema = mergedSchema.concat(schema);
        });
        return mergedSchema;
    }
}

module.exports = new JoiUtils();