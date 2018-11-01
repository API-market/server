const Sequelize = require('sequelize');
const dbObjects = require("./db_setup");
const {UploadS3Service} = require('lumeos_services');
const sequelize = dbObjects.dbInstance;

var bcrypt = require('bcrypt');

const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.S3_REGION || "us-west-2"
});

const UserBase = sequelize.define('user', {
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
  forgot_token: Sequelize.STRING,
  verify_token: Sequelize.STRING,
  phone: Sequelize.STRING,
  phone_code: Sequelize.STRING,
  tag_line: Sequelize.STRING,
  address: Sequelize.STRING,
  dob: Sequelize.STRING,
  gender: Sequelize.STRING,
  school: Sequelize.STRING,
  employer: Sequelize.STRING,
  balance: {type: Sequelize.DOUBLE, defaultValue: 500},
  followee_count: {type: Sequelize.INTEGER, defaultValue: 0},
  follower_count: {type: Sequelize.INTEGER, defaultValue: 0},
  answer_count: {type: Sequelize.INTEGER, defaultValue: 0},
  all_notifications: {type: Sequelize.BOOLEAN, defaultValue: true},
  verify: {type: Sequelize.BOOLEAN, defaultValue: false},
  verify_phone: {type: Sequelize.BOOLEAN, defaultValue: false},
  not_answers_notifications: {type: Sequelize.BOOLEAN, defaultValue: true},
  follows_you_notifications: {type: Sequelize.BOOLEAN, defaultValue: true},
  custom_notifications: {type: Sequelize.BOOLEAN, defaultValue: true},
  count_notifications: {type: Sequelize.INTEGER},
  schoolId: { type: Sequelize.INTEGER, allowNull: true },
}, {
    hooks: {
        beforeUpdate(model) {
            const phonePrev = `${model._previousDataValues.phone_code}${model._previousDataValues.phone}`;
            const phoneCurrent = `${model.phone_code}${model.phone}`;
            const verifyPhone = model._previousDataValues.verify_phone;
            if (phonePrev !== phoneCurrent && verifyPhone) {
                model.verify_phone = false
            }
        }
    },
	timestamps: true,
});

class User extends UserBase {

    static incrementPushNotifications(ids) {
        const field = 'count_notifications';
        return this.update({ [field]: Sequelize.literal(`${field} + 1`) }, {
            where: {
                id: {
                    [Sequelize.Op.in] : ids
                },
                [Sequelize.Op.or]: {
                    all_notifications: true,
                    not_answers_notifications: true
                }
            }
        });
    }

    /**
     *
     * @param [ids] array
     * @returns {*}
     */
    static clearNotifications(ids) {
        const field = 'count_notifications';
        return this.update({ [field]: 0 }, {
            where: {
                id: {
                    [Sequelize.Op.in] : ids
                }
            }
        });
    }

    static incrementOnePushNotification(id) {
        const field = 'count_notifications';
        return this.findOne({
            where: {
                id,
                [Sequelize.Op.or]: {
                    all_notifications: true,
                    not_answers_notifications: true
                }
            },
            attributes: [
                'id',
                field
            ]
        }).then((user) => {
            return user.update({ [field]: user[field] + 1 })
                .then(() => {
                    return user.getDataValue(field);
                })
        });
    }
}

const Tokens = sequelize.define('tokens', {
    user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    name: {type: Sequelize.STRING},
    token: {type: Sequelize.STRING, unique: true},
    platform: {type: Sequelize.STRING},
    active: {type: Sequelize.BOOLEAN, defaultValue: true},
});

User.Tokens = User.hasMany(Tokens, { as: 'tokens', foreignKey: 'user_id' });

Tokens.User = Tokens.belongsTo(User, {
    as: 'users',
    foreignKey: 'user_id',
    constraints: false,
});

const verifyPassword = function (password, hash) {
    return bcrypt.compareSync(password, hash || this.password);
};
User.prototype.verifyPassword = verifyPassword;


const Poll = sequelize.define('poll', {
  question: Sequelize.STRING,
  price: {type: Sequelize.DOUBLE, defaultValue: 0},
  participant_count: {type: Sequelize.INTEGER, defaultValue: 0},
  avatar: {
    type: Sequelize.STRING,
    get: function () {
      return this.getDataValue('avatar') && UploadS3Service.getImage(this.getDataValue('avatar'));
    }
  },
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
Tokens.belongsTo(Poll, {foreignKey: 'user_id'});

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
  createdAt: {
    type: Sequelize.STRING,
  },
  updatedAt: {
    type: Sequelize.STRING,
  },
  user_id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  image: {
    type: Sequelize.STRING,
    get: function () {
        return this.getDataValue('image') && UploadS3Service.getImage(this.getDataValue('image'));
    }
  },
}, {timestamps: false});

const Transaction = sequelize.define('transaction', {
  poll_id: Sequelize.INTEGER,
  user_id: Sequelize.INTEGER,
  amount: Sequelize.DOUBLE
}, {timestamps: true});

const DEFAULT_PROFILE_IMAGE = process.env.S3_DEFAULT_PROFILE_IMAGE || "https://s3-us-west-2.amazonaws.com/lumeos/profile_default_image.png";
const getProfileImage = function (user_id) {
  return ProfileImage.findOne({where: {user_id: user_id}, attributes: ["image"]})
      .then(function (profileImage) {
          if (profileImage) {
              return Promise.resolve(profileImage.image);
          }
          return Promise.resolve(DEFAULT_PROFILE_IMAGE);
      });
};

const Notifications = sequelize.define('notifications', {
    target_user_id: {type: Sequelize.INTEGER, allowNull: false},
    from_user_id: {type: Sequelize.INTEGER, allowNull: false},
    description: Sequelize.STRING,
    type: Sequelize.STRING,
});
Notifications.belongsTo(User, {foreignKey: 'from_user_id', join: 'inner'});

const CustomNotifications = sequelize.define('custom_notifications', {
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    usersId: {
        type: Sequelize.STRING,
        get: function () {
            if (this.getDataValue('usersId')) return JSON.parse(this.getDataValue('usersId'));
            return [];
        },
        set: function (val) {
            if (typeof val === "string") val = [val];
            return this.setDataValue('usersId', JSON.stringify(val));
        }
    },
    createdAt: {
        type: Sequelize.DATE,
    },
    updatedAt: {
        type: Sequelize.DATE,
    }
}, {timestamps: true});

exports.Tokens = Tokens;

module.exports = {
  User: User,
  CustomNotifications: CustomNotifications,
  Tokens: Tokens,
  Notifications: Notifications,
  Poll: Poll,
  Result: Result,
  Followship: Followship,
  ProfileImage: ProfileImage,
  Transaction: Transaction,
  getProfileImage: getProfileImage,
  verifyPassword,
}
