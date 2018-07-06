//
//  Copyright (c) 2018, Respective Authors all rights reserved.
//
//  The MIT License
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to
//  deal in the Software without restriction, including without limitation the
//  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
//  sell copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
//  IN THE SOFTWARE.
//

const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const SUPER_SECRET_JWT_KEY = process.env.SUPER_SECRET_JWT_KEY || "test";
const SEED_AUTH = process.env.SUPER_SECRET_KEY || "whatever";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  storage: 'database.sqlite'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


  const Poll = sequelize.define('poll', {
    question: Sequelize.STRING,
    price: Sequelize.DOUBLE,
    price: { type: Sequelize.DOUBLE, defaultValue: 0 },
    participant_count: { type: Sequelize.INTEGER, defaultValue: 0 },
    answers: {
      type: Sequelize.STRING,
      get: function() {
        if (this.getDataValue('answers')) return JSON.parse(this.getDataValue('answers'));
      },
      set: function(val) {
        return this.setDataValue('answers', JSON.stringify(val));
      }
    },
    tags: {
      type: Sequelize.STRING,
      get: function() {
        if (this.getDataValue('tags')) return JSON.parse(this.getDataValue('tags'));
      },
      set: function(val) {
        return this.setDataValue('tags', JSON.stringify(val));
      }
    },
    creator: Sequelize.INTEGER
  })
  const Result = sequelize.define('result', {
    poll_id: Sequelize.INTEGER,
    answer: Sequelize.STRING,
    user_id: Sequelize.INTEGER
  });

  const User = sequelize.define('user', {
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
      set: function(val) {
        if(val)
          return this.setDataValue('password', bcrypt.hashSync(val, bcrypt.genSaltSync(8)));
      }
    },
    phone: Sequelize.STRING,
    dob: Sequelize.STRING,
    gender: Sequelize.STRING,
    school: Sequelize.STRING,
    employer: Sequelize.STRING,
    balance: Sequelize.STRING
  });
  User.prototype.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  const ProfileImage = sequelize.define('profile_image', {
    user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    image: Sequelize.STRING
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

router.post('/profile_images/', function(req, res) {
  User.findById(parseInt(req.body["user_id"])).then(user =>{
    if(user)
    {
      sequelize.sync()
        .then(() => {
          ProfileImage.create(req.body)
          .then(() => {
            res.json({ user_id: req.body["user_id"] });
          })
          .catch(error => {
            res.status(400).json({ error: "Bad Request", message: "Could not create image with " + JSON.stringify(req.body)})
          })
        });
    }
    else {
      res.status(404).json({ error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
      res.status(404).json({ error: "Not Found", message: "Users table doesn't exist"})
  });
});

router.get('/profile_images/:id', function(req, res) {
  ProfileImage.findOne({ where: {user_id: parseInt(req.params["id"])} }).then(profileImage => {
    if(profileImage)
    {
      res.json(profileImage);
    }
    else {
      res.status(404).json({ error: "Not Found", message: "Profile image not found"})
    }
  }).catch(error => {
      res.status(404).json({ error: "Not Found", message: "profile_image table doesn't exist"})
  });
});

router.put('/profile_images/:id', function(req, res) {
  ProfileImage.findOne({ where: {user_id: parseInt(req.params["id"])} }).then(profileImage => {
    if(profileImage){
      profileImage.update(req.body).then(() => {
        res.status(204).json();
      }).catch(error => {
        console.log(error);
      })
    } else {
      res.status(404).json({ error: "Not Found", message: "Profile image not found"})
    }
  });
});


router.delete('/profile_images/:id', function(req, res) {
  ProfileImage.destroy({ where: {user_id: parseInt(req.params["id"])} }).then(profileImage => {
    if (profileImage) {
      res.status(202).json();
    } else {
      res.status(404).json({ error: "Not Found", message: "Profile Image not found"})
    }
  });
});

router.post('/users', function(req, res) {
  sequelize.sync()
    .then(() => {
      User.create(req.body)
      .then(user => {
        res.json({ user_id: user["id"] });
      })
      .catch(error => {
        res.status(400).json({ error: "Bad Request", message: "Could not create user with " + JSON.stringify(req.body)})
      })
    });
});

router.get('/users/:id', function(req, res) {
  User.findById(parseInt(req.params["id"]), {
    attributes: [
      "email",
      "firstName",
      "lastName",
      "phone",
      "dob",
      "gender",
      "school",
      "employer",
      "balance"
    ]
  }).then(user =>{
    if(user)
    {
      res.json(user);
    }
    else {
      res.status(404).json({ error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
      res.status(404).json({ error: "Not Found", message: "Users table doesn't exist"})
  });
});

router.get('/users', function(req, res) {
  var where_params = [];
  if(req.query["queryName"]){
    where_params.push({
        [Op.or]: [
          {firstName: {[Op.like]: "%" + req.query["queryName"] + "%"}},
          {lastName: {[Op.like]: "%" + req.query["queryName"] + "%"}}
        ]
    });
  }
  if(req.query["querySchool"]){
    where_params.push({
      school: {[Op.like]: "%" + req.query["querySchool"] + "%"}
    });
  }
  if(req.query["queryEmployer"]){
    where_params.push({
      employer: {[Op.like]: "%" + req.query["queryEmployer"] + "%"}
    });
  }
  if(req.query["queryEmail"]){
    where_params.push({
      email: req.query["queryEmail"]
    });
  }
  if(req.query["queryPhone"]){
    where_params.push({
      phone: req.query["queryPhone"]
    });
  }
  var where_object = { where: Object.assign({}, ...where_params),
    attributes: [
      "email",
      "firstName",
      "lastName",
      "phone",
      "dob",
      "gender",
      "school",
      "employer",
      "balance"
    ]
  }
  User.findAll(where_object).then( user => {
  if(user) {
    res.json(user);
  }
  else
  {
    res.status(404).json({ error: "Not Found", message: "User not found"})
  }
  }).catch(error => {
      res.status(404).json({ error: "Not Found", message: "Users table doesn't exist"})
  });
});

router.put('/users/:id', function(req, res) {
  User.findById(parseInt(req.params['id'])).then( user => {
    if(user){
      user.update(req.body).then(() => {
        res.status(204).json();
      }).catch(error => {
        console.log(error);
      })
    } else {
      res.status(404).json({ error: "Not Found", message: "User not found"})
    }
  });
});

router.delete('/users/:id', function(req, res) {
  User.findById(parseInt(req.params['id'])).then( user => {
    if (user) {
      res.status(204).json();
    } else {
      res.status(404).json({ error: "Not Found", message: "User not found"})
    }
  });
});

router.post('/polls', function(req, res) {
  sequelize.sync()
    .then(() => {
      Poll
        .build(req.body)
        .save()
        .then(poll => {
          res.json({ poll_id: poll["id"] });
        })
        .catch(error => {
          console.log(error);
        })
    })
});

router.get('/polls/:id', function(req, res) {
  Poll.find({
    where: {
      id: parseInt(req.params["id"])
    },
    attributes: [
      ["id", "poll_id"],
      "question",
      "answers",
      "participant_count",
      "price"
    ]
  }).then(poll =>{
    if(poll) {
      res.json(poll);
    } else {
      res.status(404).json({ error: "Not Found", message: "Poll not found"})
    }
  })
});

router.get('/polls', function(req, res) {
  var where_params = [];
  if(req.query["queryCreator"]){
    where_params.push({
      creator: req.query["queryCreator"]
    });
  }
  if(req.query["queryQuestion"]){
    where_params.push({
      question: {[Op.like]: "%" + req.query["queryQuestion"] + "%"}
    });
  }
  var where_object = { where: Object.assign({}, ...where_params)}
  where_object.attributes = [["id", "poll_id"], "question", "answers", "participant_count", "price", "creator"];
  Poll.findAll(where_object).then( poll => {
  if(poll) {
    res.json(poll);
  }
  else
  {
    res.status(404).json({ error: "Not Found", message: "Poll not found"})
  }
  }).catch(error => {
      res.status(404).json({ error: "Not Found", message: "poll table doesn't exist"})
  });
});

router.post('/polls/:poll_id', function(req, res) {
  User.findById(parseInt(req.body["user_id"])).then(user =>{
    if(user)
    {
      sequelize.sync()
        .then(() => {
          Poll.findById(parseInt(req.params["poll_id"])).then(poll => {
            if(poll) {
              Result
                .build({ poll_id: poll["id"], answer: req.body["answer"], user_id: parseInt(req.body["user_id"])})
                .save()
                .then(result => {
                  poll.increment('participant_count')
                  res.status(204).json();
                })
                .catch(error => {
                  console.log(error);
                })
              } else {
                res.status(404).json({ error: "Not Found", message: "Poll not found"})
              }
          })
        })
    }
    else {
      res.status(404).json({ error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
      res.status(404).json({ error: "Not Found", message: "Users table doesn't exist"})
  });
});

router.post('/polls/:poll_id/results', function(req, res) {
  sequelize.sync()
    .then(() => {
      var pollId = parseInt(req.params["poll_id"]);
      Poll.findById(pollId).then(poll => {
        var temp = []
        poll["answers"].forEach( element => {
          temp.push([element, 0]);
        })
        Result.findAll({ where: { poll_id: pollId } }).then(results => {
          results.forEach( element => {
            temp[parseInt(element["answer"])] = [temp[parseInt(element["answer"])][0],temp[parseInt(element["answer"])][1] + 1];
          })
        }).then(() => {
          var answers = {};
          temp.forEach( element => {
            answers[element[0]] = element[1];
          })
          res.json({
            poll_id: poll["id"],
            question: poll["question"],
            answers: answers
          });
        })
      })
    })
});

router.post('/logout', function(req, res) {
  res.status(501).json();
});

router.post('/login', function(req, res) {
  User.findOne( { where: { email: req.body["email"] } } ).then(function(user){
    if(user.verifyPassword(req.body["password"])){
      res.json(
        {
          token: jwt.sign(
            {
              user_id: user['id'],
              iat: Math.floor(new Date() / 1000)
            },
            SUPER_SECRET_JWT_KEY
          )
        }
      )
    }
  })
});

app.use(function (req, res, next) {
  if(req.url.endsWith("/login") || req.url.endsWith("/login/")){
    next()
  } else {
    var token = req.headers.authorization.split(" ")[1];
    if(token){
      try {
        var decoded = jwt.verify(token, SUPER_SECRET_JWT_KEY);
        next()
      } catch(err) {
        console.log(err)
        res.status(401).json({ message: "Unauthorized: JWT token not provided"});
      }
    } else {
      res.status(401).json({ message: "Unauthorized: JWT token not provided"});
    }
  }
})
app.use('/v1', router);
app.listen(3000);
console.log('listening on port ' + 3000);
