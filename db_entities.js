const Sequelize = require('sequelize');
const dbObjects = require("./db_setup");

const sequelize = dbObjects.dbInstance;

var bcrypt = require('bcrypt');
const atob = require('atob');

const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: 'us-west-2'
});
const s3 = new AWS.S3();
const lumeosS3Bucket = new AWS.S3({params: {Bucket: 'lumeos'}});

const rekognition = new AWS.Rekognition();

const profile_images_key = "profile_images_" + process.env.LUMEOS_ENV;

var tinify = require("tinify");
tinify.key = process.env.TINIFY_API_KEY;

function imageFromBase64(dataURI) {
  var binary = atob(dataURI);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return Buffer.from(new Uint8Array(array));
}

const User = sequelize.define('user', {
  eos: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    set: function (val) {
      if (val)
        return this.setDataValue('password', bcrypt.hashSync(val, bcrypt.genSaltSync(8)));
    }
  },
  phone: Sequelize.STRING,
  dob: Sequelize.STRING,
  gender: Sequelize.STRING,
  school: Sequelize.STRING,
  employer: Sequelize.STRING,
  balance: {type: Sequelize.DOUBLE, defaultValue: 500},
  followee_count: {type: Sequelize.INTEGER, defaultValue: 0},
  follower_count: {type: Sequelize.INTEGER, defaultValue: 0},
  answer_count: {type: Sequelize.INTEGER, defaultValue: 0}
});

const Address = sequelize.define('address', {
  street: Sequelize.STRING,
  city: Sequelize.STRING,
  region: Sequelize.STRING,
  postalCode: Sequelize.STRING,
});

User.Address = User.belongsTo(Address, {as: 'address', constraints: false});

User.prototype.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const Poll = sequelize.define('poll', {
  question: Sequelize.STRING,
  price: {type: Sequelize.DOUBLE, defaultValue: 0},
  participant_count: {type: Sequelize.INTEGER, defaultValue: 0},
  answers: {
    type: Sequelize.STRING,
    get: function () {
      if (this.getDataValue('answers')) return JSON.parse(this.getDataValue('answers'));
    },
    set: function (val) {
      return this.setDataValue('answers', JSON.stringify(val));
    }
  },
  tags: {
    type: Sequelize.STRING,
    get: function () {
      if (this.getDataValue('tags')) return JSON.parse(this.getDataValue('tags'));
    },
    set: function (val) {
      return this.setDataValue('tags', JSON.stringify(val));
    }
  },
  creator_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  }
});

// Result keeps track of user answering to a poll
const Result = sequelize.define('result', {
  poll_id: Sequelize.INTEGER,
  answer: Sequelize.STRING,
  user_id: Sequelize.INTEGER
});

// Relationship between follower and followee
// Could not come up with better name :)
const Followship = sequelize.define('followship', {
  follower_id: Sequelize.INTEGER,
  followee_id: Sequelize.INTEGER
});

const ProfileImage = sequelize.define('profile_image', {
  user_id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  image: {
    type: Sequelize.STRING,
    set: function (val) {

      var params = {
        Image: {
          Bytes: new Buffer(val, 'base64')
        },
        MinConfidence: 50.0
      };
      rekognition.detectModerationLabels(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else if (data["ModerationLabels"].length > 0) {
          console.log("bad image");
          console.log(data);
        } else {
          // Image is prob ok
          var imageBuffer = imageFromBase64(val);
          tinify.fromBuffer(imageBuffer).toBuffer(function (err, resultData) {
            if (err) {
              console.log("Could not compress image for user_id: " + this.getDataValue('user_id'));
              // if compression fails, its not critical. We can upload.
            } else {
              imageBuffer = resultData;
            }
            const data = {
              Key: profile_images_key + this.getDataValue('user_id'),
              Body: imageBuffer,
              ContentType: 'image/png'
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
});

const Transaction = sequelize.define('transaction', {
  poll_id: Sequelize.INTEGER,
  user_id: Sequelize.INTEGER,
  amount: Sequelize.DOUBLE
});

const DEFAULT_PROFILE_IMAGE = "https://s3-us-west-2.amazonaws.com/lumeos/profile_default_image.png";
const getProfileImage = function (user_id) {
  const urlParams = {
    Key: profile_images_key + user_id,
  };
  var p = new Promise(function (resolve, reject) {
    ProfileImage.findOne({where: {user_id: user_id}, attributes: ["image"]}).then(function (image) {
      if (image) {
        lumeosS3Bucket.getSignedUrl('getObject', urlParams, (err, url) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(url);
          }
        });
      } else {
        resolve(DEFAULT_PROFILE_IMAGE);
      }
    });
  }).catch((err) => console.error(err));
  return p;
};


module.exports = {
  User: User,
  Poll: Poll,
  Result: Result,
  Followship: Followship,
  ProfileImage: ProfileImage,
  Transaction: Transaction,
  getProfileImage: getProfileImage
}
