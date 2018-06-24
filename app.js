const express = require('express');
const app = express();
var bodyParser = require('body-parser');

const Sequelize = require('sequelize');
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
    answers: {
      type: Sequelize.STRING, 
      get: function() {
          return JSON.parse(this.getDataValue('answers'));
      }, 
      set: function(val) {
          return this.setDataValue('answers', JSON.stringify(val));
      }
    },
    tags: {
      type: Sequelize.STRING, 
      get: function() {
          return JSON.parse(this.getDataValue('tags'));
      }, 
      set: function(val) {
          return this.setDataValue('tags', JSON.stringify(val));
      }
    }
  })
  const Result = sequelize.define('result', {
    poll_id: Sequelize.INTEGER,
    answer: Sequelize.STRING,
    user_id: Sequelize.INTEGER
  });
  
  const User = sequelize.define('user', {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    dob: Sequelize.STRING,
    gender: Sequelize.STRING,
    school: Sequelize.STRING,
    school: Sequelize.STRING,
    employer: Sequelize.DATE
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();



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

router.get('/user/:id', function(req, res) {
  User.findById(parseInt(req.params["id"])).then(user =>{
    res.json(user);
  })
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

router.get('/poll/:id', function(req, res) {
  Poll.findById(parseInt(req.params["id"])).then(poll =>{
    res.json(poll);
  })
});

router.post('/polls/:poll_id', function(req, res) {
  sequelize.sync()
    .then(() => {
      Poll.findById(parseInt(req.params["poll_id"])).then(poll => {
        Result
          .build({ poll_id: poll["id"], answer: req.body["answer"], user_id: parseInt(req.body["user_id"])})
          .save()
          .then(result => {
            res.status(204).json();
          })
          .catch(error => {
            console.log(error);
          })
      })
    })
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

app.use('/v1', router);
app.listen(3000);
console.log('listening on port ' + 3000);
