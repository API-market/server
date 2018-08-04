const Sequelize = require('sequelize');
const dbObjects = require("./db_setup");

const sequelize = dbObjects.dbInstance;

var bcrypt = require('bcrypt');

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
  balance: {type: Sequelize.DOUBLE, defaultValue: 10},
  followee_count: {type: Sequelize.INTEGER, defaultValue: 0},
  follower_count: {type: Sequelize.INTEGER, defaultValue: 0}
});

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
  image: Sequelize.TEXT
});

const Transaction = sequelize.define('transaction', {
  poll_id: Sequelize.INTEGER,
  user_id: Sequelize.INTEGER,
  amount: Sequelize.DOUBLE
});

module.exports = {
  User: User,
  Poll: Poll,
  Result: Result,
  Followship: Followship,
  ProfileImage: ProfileImage,
  Transaction: Transaction
}
