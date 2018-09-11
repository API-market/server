const AWS = require('aws-sdk');
const crypto = require('crypto');
const {resolve} = require('url');

class UploadS3Service {

    constructor() {
        AWS.config.update({
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
            region: process.env.S3_REGION || 'us-west-2'
        });
        this.bucketName = process.env.S3_BUCKET_NAME || 'lumeos';
        this.S3Host = process.env.S3_BUCKET_PATH || 'https://s3.us-east-2.amazonaws.com';
        this.constants = {
            DEFAULT_IMAGE_FORMAT: '.png'
        };
        this.type = {
            [this.constants.DEFAULT_IMAGE_FORMAT]: 'image/png',
        };
        this.hash = () => crypto.randomBytes(12).toString('hex');

        this.bucket = new AWS.S3({params: {Bucket: this.bucketName}});
    }

    /**
     *
     * @param file
     * @param dir
     * @returns {AWS.S3.Types.PutObjectRequest}
     */
    formatData(file, dir = 'polls') {
        return {
            Key: `${dir}/${this.hash()}_${file.originalname}`,
            Body: new Buffer(file.buffer, 'binary'),
            ContentType: file.mimetype || [this.constants.DEFAULT_IMAGE_FORMAT],
            ACL: 'public-read',
        };
    }

    /**
     * Upload file to S3
     * @param file
     * @param dir
     * @this {UploadS3Service}
     * @returns {Promise<any>}
     */

    upload(file, dir) {
        return new Promise((resolve, reject) => {
            const data = this.formatData(file, dir);
            return this.bucket.putObject(data, (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve(Object.assign(data, {bucket: this.bucketName, file: data.Key}, {S3: result}));
            });
        });
    }

    /**
     * Get full url on the file
     * @param fileName
     * @this {UploadService}
     * @returns {*}
     */
    getImage(fileName) {
        return resolve(this.S3Host, `${this.bucketName}/${fileName}`)
    }
}

module.exports = new UploadS3Service();