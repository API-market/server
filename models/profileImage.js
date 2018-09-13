'use strict';

const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.S3_REGION || 'us-west-2'
});

const lumeosS3Bucket = new AWS.S3({params: {Bucket: process.env.S3_BUCKET_NAME || 'lumeos'}});

const rekognition = new AWS.Rekognition();

function imageFromBase64(dataURI) {
    var binary = atob(dataURI);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return Buffer.from(new Uint8Array(array));
}

module.exports = (sequelize, DataTypes) => {
    const ProfileImages = sequelize.define('profile_images', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        image: {
            type: DataTypes.STRING,
            set: function (val) {

                const params = {
                    Image: {
                        Bytes: new Buffer(val, 'base64')
                    },
                    MinConfidence: 50.0
                };
                rekognition.detectModerationLabels(params, function (err, data) {
                    if (err) console.log(err, err.stack);
                    else if (data['ModerationLabels'].length > 0) {
                        console.log('bad image');
                        console.log(data);
                    } else {
                        // Image is prob ok
                        var imageBuffer = imageFromBase64(val);
                        tinify.fromBuffer(imageBuffer).resize({
                            method: 'fit',
                            width: 150,
                            height: 150
                        })
                            .toBuffer(function (err, resultData) {
                                if (err) {
                                    console.log('Could not compress image for user_id: ' + this.getDataValue('user_id'));
                                    // if compression fails, its not critical. We can upload.
                                } else {
                                    imageBuffer = resultData;
                                }
                                const data = {
                                    Key: profile_images_key + this.getDataValue('user_id') + DEFAULT_IMAGE_FORMAT,
                                    Body: imageBuffer,
                                    ContentType: 'image/png',
                                    ACL: 'public-read'
                                };
                                lumeosS3Bucket.putObject(data, function (err, data) {
                                    if (err) {
                                        console.log(err);
                                        console.log('Error uploading data: ', data);
                                    } else {
                                        console.log('succesfully uploaded the image!');
                                    }
                                });
                            }.bind(this));
                    }
                }.bind(this));
            }
        },
    }, {});
    ProfileImages.associate = function (models) {
        // this.belongsTo(models.Polls, {foreignKey: 'user_id'});
    };
    return ProfileImages;
};