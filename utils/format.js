const translate = require('translitit-cyrillic-russian-to-latin');

class Format {

    slug(str) {
        str = translate(str)
            .replace(/ /g, '_')
            .replace(/-/g, '_')
            .replace(/,/g, '')
            .replace(/\//g, '_')
            .replace(/°/g, '')
            .replace(/\+/g, '')
            .replace(/³/g, '')
            .replace('|', '').toLowerCase();

        return str.replace(/_{1,5}/g, '_');
    }

    messageValidate(err, field) {
        switch (field) {
            case 'phone':
                return "The mobile number you entered is already registered. Please enter a different mobile number";
            case 'email':
                return "The email you entered is already registered. Please enter a different email";
            default:
                return `The ${err.message.replace('_', ' ')}.`
        }
    }
}

module.exports = Format;