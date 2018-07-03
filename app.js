const express = require('express');
const app = express();
var bodyParser = require('body-parser');

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
    employer: Sequelize.STRING,
    balance: Sequelize.STRING
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

router.get('/users/:id', function(req, res) {
  User.findById(parseInt(req.params["id"])).then(user =>{
    res.json(user);
  })
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
  var where_object = { where: Object.assign({}, ...where_params)}
  User.findAll(where_object).then( user => {
    res.json(user);
  }).catch(error => {
    console.log(error);
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
  if(req.query["queryQuestion"]){
    where_params.push({
      question: {[Op.like]: "%" + req.query["queryQuestion"] + "%"}
    });
  }
  var where_object = { where: Object.assign({}, ...where_params)}
  where_object.attributes = [["id", "poll_id"], "question", "answers", "participant_count", "price" ];
  Poll.findAll(where_object).then( poll => {
    if (poll) {
      res.json(poll);
    } else {
      res.json();
    }
  }).catch(error => {
    console.log(error);
  });
});

router.post('/polls/:poll_id', function(req, res) {
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

router.post('/login', function(req, res) {
  res.status(501).json();
});

router.post('/logout', function(req, res) {
  res.status(501).json();
});

app.use('/v1', router);
app.listen(3000);
console.log('listening on port ' + 3000);
