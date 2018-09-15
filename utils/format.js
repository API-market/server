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
}

module.exports = Format;