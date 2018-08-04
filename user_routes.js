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
const {check, validationResult} = require('express-validator/check');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const dbObjects = require("./db_setup.js");
const sequelize = dbObjects.dbInstance;

const db_entities = require("./db_entities.js");
var User = db_entities.User;
var ProfileImage = db_entities.ProfileImage;

var util = require("./utilities.js");
const removeEmpty = util.removeEmpty;

const STANDARD_USER_ATTR = [
  "email",
  "eos",
  "firstName",
  "lastName",
  "phone",
  "dob",
  "gender",
  "school",
  "employer",
  "balance",
  "follower_count",
  "followee_count"
];


var userRouter = express.Router();

userRouter.post('/login', function (req, res) {
  User.findOne({where: {email: req.body["email"]}}).then(function (user) {
    if (user && user.verifyPassword(req.body["password"])) {
      res.json(
        {
          user_id: user['id'],
          token: jwt.sign(
            {
              user_id: user['id'],
              iat: Math.floor(new Date() / 1000)
            },
            require("./server_info.js").SUPER_SECRET_JWT_KEY
          )
        }
      )
    } else {
      res.status(404).json({error: "Not Found", message: "User not found or password is incorrect."})
    }
  })
});

userRouter.post('/logout', function (req, res) {
  res.status(501).json();
});

userRouter.post('/users', [
  check("firstName").not().isEmpty().trim().escape().withMessage("Field 'firstName' cannot be empty"),
  check("lastName").not().isEmpty().trim().escape().withMessage("Field 'lastName' cannot be empty"),
  check("email").isEmail().normalizeEmail(),
  check("phone").optional().isMobilePhone("any"),
  check("dob").isISO8601().withMessage("Invalid 'dob' specified, ISO8601 required"),
  check("gender").optional().isIn(["male", "female", "other"]),
  check("school").optional().trim().escape(),
  check("employer").optional().trim().escape(),
  check('password', 'The password must be 8+ chars long and contain a number')
    .not().isIn(['123456789', '12345678', 'password1']).withMessage('Do not use a common word as the password')
    .isLength({min: 8})
    .matches(/\d/)
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  sequelize.sync()
    .then(() => {
      User.create(req.body)
        .then(user => {
          res.json({user_id: user["id"]});
        })
        .catch(error => {
          console.log("error: " + error);
          res.status(400).json({
            error: "Bad Request",
            message: "Could not create user with " + JSON.stringify(req.body)
          })
        })
    });
});

userRouter.get('/users/:id', function (req, res) {
  User.findById(parseInt(req.params["id"]), {
    attributes: STANDARD_USER_ATTR
  }).then(user => {
    if (user) {
      res.json(removeEmpty(user));
    }
    else {
      res.status(404).json({error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});

userRouter.get('/users', function (req, res) {
  var where_params = [];
  if (req.query["queryName"]) {
    where_params.push({
      [Op.or]: [
        {firstName: {[Op.like]: "%" + req.query["queryName"] + "%"}},
        {lastName: {[Op.like]: "%" + req.query["queryName"] + "%"}}
      ]
    });
  }
  if (req.query["querySchool"]) {
    where_params.push({
      school: {[Op.like]: "%" + req.query["querySchool"] + "%"}
    });
  }
  if (req.query["queryEmployer"]) {
    where_params.push({
      employer: {[Op.like]: "%" + req.query["queryEmployer"] + "%"}
    });
  }
  if (req.query["queryEmail"]) {
    where_params.push({
      email: req.query["queryEmail"]
    });
  }
  if (req.query["queryPhone"]) {
    where_params.push({
      phone: req.query["queryPhone"]
    });
  }
  var where_object = {
    where: Object.assign({}, ...where_params),
    attributes: [
      ["id", "user_id"],
      "email",
      "eos",
      "firstName",
      "lastName",
      "phone",
      "dob",
      "gender",
      "school",
      "employer",
      "balance",
      "follower_count",
      "followee_count"
    ]
  };
  User.findAll(where_object).then(user => {
    if (user) {
      res.json(removeEmpty(user));
    }
    else {
      res.status(404).json({error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});


// make follower follow followee
userRouter.post('/follow', function (req, res) {
  const followee_id = parseInt(req.body["followee_id"]);
  const follower_id = parseInt(req.body["follower_id"]);
  User.findById(followee_id).then(followee => {
    if (followee) {
      sequelize.sync()
        .then(() => {
          User.findById(follower_id).then(follower => {
            if (follower) {
              Followship.findOrCreate({
                where: {
                  follower_id: follower_id,
                  followee_id: followee_id
                }
              }).spread((result, created) => {
                if (created) {
                  // We don't want to query Followship every time we want to know the count,
                  // so lets just update variables.
                  followee.increment("follower_count");
                  follower.increment("followee_count");
                  res.status(204).json();
                } else {
                  res.status(400).json({
                    error: "Bad Request",
                    message: "Follower_id: " + follower_id + " already follows, folowee_id: " + followee_id
                  });
                }
              })
            } else {
              res.status(404).json({error: "Not Found", message: "Follower with id " + follower_id + " not found"});
            }
          })
        })
    }
    else {
      res.status(404).json({error: "Not Found", message: "Followee with id " + followee_id + " not found"});
    }
  }).catch(error => {
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});

// get followers for user_id
userRouter.get('/followers/:user_id', function (req, res) {
  const user_id = parseInt(req.params["user_id"]);
  User.findById(user_id).then(user => {
    if (user) {
      sequelize.sync()
        .then(() => {
          Followship.findAll({
            where: {followee_id: user_id},
            attributes: ["follower_id"]
          }).then(result => {
            if (!Array.isArray(result) || !result.length) {
              result = [];
              return res.json([]);
            }
            User.findAll({
              where: {id: {[Op.in]: result.map(x => x.dataValues["follower_id"])}},
              attributes: STANDARD_USER_ATTR
            }).then(followers => {
              res.json(removeEmpty(followers));
            });
          }) // followshipt.findAll
        })
    } else {
      res.status(404).json({error: "Not Found", message: "User with id " + user_id + " not found"});
    }
  }).catch(error => {
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});

// get followee for user_id
userRouter.get('/followees/:user_id', function (req, res) {
  const user_id = parseInt(req.params["user_id"]);
  User.findById(user_id).then(user => {
    if (user) {
      sequelize.sync()
        .then(() => {
          Followship.findAll({
            where: {follower_id: user_id},
            attributes: ["followee_id"]
          }).then(result => {
            if (!Array.isArray(result) || !result.length) {
              result = [];
              return res.json([]);
            }
            User.findAll({
              where: {id: {[Op.in]: result.map(x => x.dataValues["followee_id"])}},
              attributes: STANDARD_USER_ATTR
            }).then(followers => {
              res.json(removeEmpty(followers));
            });
          }) // followshipt.findAll
        })
    } else {
      res.status(404).json({error: "Not Found", message: "User with id " + user_id + " not found"});
    }
  }).catch(error => {
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});

userRouter.post('/profile_images/', [
  check("user_id").isInt().withMessage("Field 'user_id' must be an int."),
  check("image").isBase64().withMessage("Field 'image' must be in base64 format."),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  User.findById(parseInt(req.body["user_id"])).then(user => {
    if (user) {
      sequelize.sync()
        .then(() => {
          ProfileImage.create(req.body)
            .then(() => {
              res.json({user_id: req.body["user_id"]});
            })
            .catch(error => {
              console.log("error: " + error);
              res.status(400).json({
                error: "Bad Request",
                message: "Could not create image with " + JSON.stringify(req.body)
              })
            })
        });
    }
    else {
      res.status(404).json({error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});

userRouter.get('/profile_images/:id', function (req, res) {
  ProfileImage.findOne({where: {user_id: parseInt(req.params["id"])}}).then(profileImage => {
    if (profileImage) {
      res.json(removeEmpty(profileImage));
    }
    else {
      res.status(404).json({error: "Not Found", message: "Profile image not found"})
    }
  }).catch(error => {
    res.status(404).json({error: "Not Found", message: "profile_image table doesn't exist"})
  });
});

userRouter.put('/profile_images/:id', function (req, res) {
  ProfileImage.findOne({where: {user_id: parseInt(req.params["id"])}}).then(profileImage => {
    if (profileImage) {
      profileImage.update(req.body).then(() => {
        res.status(204).json();
      }).catch(error => {
        console.log(error);
      })
    } else {
      res.status(404).json({error: "Not Found", message: "Profile image not found"})
    }
  });
});


userRouter.delete('/profile_images/:id', function (req, res) {
  ProfileImage.destroy({where: {user_id: parseInt(req.params["id"])}}).then(profileImage => {
    if (profileImage) {
      res.status(202).json();
    } else {
      res.status(404).json({error: "Not Found", message: "Profile Image not found"})
    }
  });
});

userRouter.put('/users/:id', function (req, res) {
  User.findById(parseInt(req.params['id'])).then(user => {
    if (user) {
      user.update(req.body).then(() => {
        res.status(204).json();
      }).catch(error => {
        console.log(error);
      })
    } else {
      res.status(404).json({error: "Not Found", message: "User not found"})
    }
  });
});

userRouter.delete('/users/:id', function (req, res) {
  User.findById(parseInt(req.params['id'])).then(user => {
    if (user) {
      res.status(204).json();
    } else {
      res.status(404).json({error: "Not Found", message: "User not found"})
    }
  });
});

module.exports = userRouter;