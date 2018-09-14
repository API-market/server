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
const {events, token, model} = require('lumeos_utils');
const {mailService, UploadService} = require('lumeos_services');
const {omit} = require('lodash');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const dbObjects = require("./db_setup.js");
const sequelize = dbObjects.dbInstance;

const db_entities = require("./db_entities.js");
const {verifyPassword} = db_entities;
const jwt = require('jsonwebtoken');

const User = db_entities.User;
const Address = db_entities.Address;
const Tokens = db_entities.Tokens;
const ProfileImage = db_entities.ProfileImage;
const Followship = db_entities.Followship;
const getProfileImage = db_entities.getProfileImage;

var util = require("./utilities.js");
const removeEmpty = util.removeEmpty;

const STANDARD_USER_ATTR = [
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
  "followee_count",
  "answer_count",
  "all_notifications",
  "verify_token",
  "verify",
];

const EXCLUDE_USER_ATTR = ['id', 'password', 'createdAt'];


var userRouter = express.Router();

const getToken = (user) => {
    return jwt.sign(
        {
            user: user.toJSON(),
            user_id: user['id'],
            iat: Math.floor(new Date() / 1000)
        },
        require('./server_info.js').SUPER_SECRET_JWT_KEY
    )
}

const emailValidate = check("email").isEmail().normalizeEmail();

userRouter.post('/login', [
    emailValidate,
    check("token_phone").exists().isString().trim().escape().withMessage("Field 'token_phone' cannot be empty"),
    check("platform").exists().isString().trim().escape().isIn(['ios', 'android', 'window']).withMessage('Platform must be android, ios, window'),
    check("name_phone").isString().trim().escape().withMessage("Field 'name_phone' cannot be empty"),
    check('password', 'The password must be 8+ chars long and contain a number')
        .not().isIn(['123456789', '12345678', 'password1']).withMessage('Do not use a common word as the password')
        .isLength({min: 8})
        .matches(/\d/)
], function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
  }
    User.findOne(
        {where: {email: req.body['email']}},
        {include: [{association: User.Tokens}]}
    ).then(function (user) {
        if (user && user.verifyPassword(req.body['password'])) {
            Tokens.upsert({
                user_id: user.id,
                token: req.body.token_phone,
                name: req.body.name_phone,
                platform: req.body.platform,
            }).then((data) => {
            console.log('<><><><> Token create <><><<><><><', JSON.stringify(data));
          }).catch((err) => {
            console.log(err, '<<<');
            // return res.status(400).json({error: "Bad Request", message: err.message})
          })
            const dataUser = {
                user_id: user['id'],
                token: getToken(user)
            };
            Object.keys(dataUser).map(e => user.dataValues[e] = dataUser[e]);
            addProfileImage(res, user, EXCLUDE_USER_ATTR);
    } else {
      res.status(404).json({error: "Not Found", message: "User not found or password is incorrect."})
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).json({error: "Error", message: "Some error."})
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
      User.create(req.body, {
        include: [{
          association: User.Address
        }]
      })
        .then(user => {
            return Tokens.upsert({
                user_id: user.id,
                token: req.body.token_phone,
                name: req.body.name_phone,
                platform: req.body.platform,
            }).then((data) => {
                console.log('<><><><> Token create <><><<><><><', JSON.stringify(data));
                const dataUser = {
                    user_id: user['id'],
                    token: getToken(user)
                };
                Object.keys(dataUser).map(e => user.dataValues[e] = dataUser[e]);
                return addProfileImage(res, user, EXCLUDE_USER_ATTR);
            });
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

const addProfileImage = function (res, user, exclude) {
  const userId = user.dataValues["user_id"];
  return getProfileImage(userId).then(result => {
    user.dataValues["profile_image"] = result;
    user = removeEmpty(user);
    if(exclude) {
      user = omit(user.toJSON(), exclude)
    }
    res.json(user);
  });
}

userRouter.get('/users/:id', function (req, res) {
  const userId = parseInt(req.params["id"]);
  User.findById(userId, {
    attributes: STANDARD_USER_ATTR,
    include: [
      {association: User.Address, as: 'address'}
    ],
  }).then(user => {
    if (user) {
      if (req.query["isFollowerOf"]) {
        user.dataValues["is_follower"] = 0;
        Followship.findOne({
          where: {
            follower_id: userId,
            followee_id: parseInt(req.query["isFollowerOf"]),
          },
          attributes: ["follower_id"]
        }).then(result => {
          if (result) {
            user.dataValues["is_follower"] = 1;
          }
          addProfileImage(res, user);
        }).catch(error => {
          console.log("I guess this is a first follow ever? user_id: " + req.query["isFollowerOf"] + ", poll_id: " + req.param["id"]);
          console.log(error);
          res.json(removeEmpty(poll));
        });
      } else if (req.query["isFolloweeOf"]) {
        user.dataValues["is_followee"] = 0;
        Followship.findOne({
          where: {
            follower_id: parseInt(req.query["isFolloweeOf"]),
            followee_id: userId,
          },
          attributes: ["followee_id"]
        }).then(result => {
          if (result) {
            user.dataValues["is_followee"] = 1;
          }
          addProfileImage(res, user);
        }).catch(error => {
          console.log("I guess this is a first follow ever? user_id: " + req.query["isFolloweeOf"] + ", poll_id: " + req.param["id"]);
          console.log(error);
          res.json(removeEmpty(poll));
        });
      } else {
        addProfileImage(res, user);
      }
    } else {
      console.log("error: " + error);
      res.status(404).json({error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
    console.log("error: " + error);
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});

userRouter.get('/users', function (req, res) {
  let orderParams = [];
  let limit = 10e3;
  if (req.query["orderBy"]) {
    orderParams.push([sequelize.col(req.query["orderBy"]), 'DESC'])
  }
  if (req.query["limit"]) {
    limit = req.query["limit"];
  }
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
    order: orderParams,
    limit: limit,
    attributes: STANDARD_USER_ATTR
  };
  User.findAll(where_object).then(users => {
    if (users) {
      return Promise.all(users.map(x => getProfileImage(x.dataValues["user_id"]))).then(result => {
        users.map((elem, index) => elem.dataValues["profile_image"] = result[index]);
        res.json(removeEmpty(users));
      });
    }
    else {
      res.status(404).json({error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});


// make follower follow followee
userRouter.post('/follow', [
    check("followee_id").exists().isInt().trim().escape().withMessage("Field 'followee_id' cannot be empty"),
    check("follower_id").exists().isInt().trim().escape().withMessage("Field 'followerprofile_image_id' cannot be empty")
], function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
  }
  const followee_id = parseInt(req.body["followee_id"]);
  const follower_id = parseInt(req.body["follower_id"]);

  if (followee_id === follower_id) {
    return res.status(400).json({
        error: 'Bad Request',
        message: 'You can\'t subscribe on yourself'
    })
  }
  User.findById(followee_id, {
    include: [
        {association: User.Tokens}
    ]
  }).then(followee => {
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

                  /**
                   * create notification
                   */
                  events.emit(events.constants.sendFolloweeFromFollower, {
                    all_notifications: followee.all_notifications,
                    target_user_id: followee.id,
                    from_user_id: follower.id,
                    nickname: `${follower.firstName} ${follower.lastName}`
                  });

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

userRouter.delete('/follow', function (req, res) {
  const followee_id = parseInt(req.body["followee_id"]);
  const follower_id = parseInt(req.body["follower_id"]);
  Followship.destroy({
      where: {
        follower_id: follower_id,
        followee_id: followee_id
      }
    }
  ).then(result => {
    if (result) {
      User.findById(followee_id).then(followee => {
        if (followee) {
          followee.decrement("follower_count");
        }
      });
      User.findById(follower_id).then(follower => {
        if (follower) {
          follower.decrement("followee_count");
        }
      });
      res.status(202).json();
    } else {
      res.status(404).json({error: "Not Found", message: "Followship not found"})
    }
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
              Promise.all(followers.map(x => getProfileImage(x.dataValues["user_id"]))).then(result => {
                followers.map((elem, index) => elem.dataValues["profile_image"] = result[index]);
                res.json(removeEmpty(followers));
              });
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
            }).then(followees => {
              Promise.all(followees.map(x => getProfileImage(x.dataValues["user_id"]))).then(result => {
                followees.map((elem, index) => elem.dataValues["profile_image"] = result[index]);
                res.json(removeEmpty(followees));
              });
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

userRouter.post('/profile_images/', UploadService.middleware('image'), [
  check("user_id").isInt().withMessage("Field 'user_id' must be an int."),
  check("image").custom((value, {req}) => {
      if (typeof req.file === "undefined") {
          throw new Error("Field 'image' must be image.")
      }
      return true;
  }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  User.findById(parseInt(req.body["user_id"])).then(user => {
    if (user) {
        return ProfileImage.findById(req.body["user_id"]).then((profile) => {
            if (profile) {
                throw new Error('Image exist for current user');
            }
            return UploadService.upload(req.file, 'users').then(({file: image}) => {
                Object.assign(req.body, {image});
                return ProfileImage.create(req.body)
                    .then((profile) => {
                        res.json(profile.toJSON())
                    });
            }).catch(error => {
                console.log("error: " + error);
                res.status(400).json({
                    error: "Bad Request",
                    message: "Could not create image with " + JSON.stringify(req.body)
                })
            })
        }).catch((error) => {
            console.log(error);
            res.status(400).json({error: "Bad Request", message: error.message})
        })
    }
    else {
      res.status(404).json({error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
    console.log(error, '<<<');
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});

userRouter.get('/profile_images/:id', function (req, res, ) {
  const userId = parseInt(req.params["id"]);
  ProfileImage.findOne({
      where: {
        user_id: userId
      }
  }).then(profileImage => {
    if (profileImage) {
        res.json(removeEmpty(profileImage))
    }
    else {
      res.status(404).json({error: "Not Found", message: "Profile image not found"})
    }
  }).catch(error => {
    res.status(404).json({error: "Not Found", message: "profile_image table doesn't exist"})
  });
});

userRouter.put('/profile_images/:id',
    UploadService.middleware('image'),
    [
        check("image").custom((value, {req}) => {
            if (typeof req.file === "undefined") {
                throw new Error("Field 'image' must be image.")
            }
            return true;
        })
    ], function (req, res) {
      ProfileImage.findOne({
          where: {
              user_id: parseInt(req.params['id'])
          }
      })
      .then(profileImage => {
          if (profileImage) {
              Object.assign(req.body, req.file);
              return UploadService.upload(req.file, 'users').then(({file: image}) => {
                  Object.assign(req.body, {image});
                  return profileImage.update(req.body).then((profileImage) => {
                      res.json(profileImage.toJSON());
                  });
              });
          } else {
              res.status(404).json({error: 'Not Found', message: 'Profile image not found'});
          }
      }).catch(error => {
        console.log(error);
        res.status(500).json({error: 'Error', message: 'Some error.'});
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

userRouter.put('/users',
    function (req, res, next) {
        if (req.body.password) {
            check('password', 'The password must be 8+ chars long and contain a number')
                .not().isIn(['123456789', '12345678', 'password1']).withMessage('Do not use a common word as the password')
                .isLength({min: 8})
                .matches(/\d/)(req);
            check('confirmPassword')
                .custom((value, {req}) => {
                    if (value !== req.body.password) {
                        throw new Error('Password confirmation does not match password');
                    }
                    return true;
                })(req);
            check('currentPassword')
                .custom((value, {req}) => {
                    if ((!req.auth || !req.body.currentPassword)) {
                        throw new Error('Current Password wrong');
                    }
                    return User.findById(parseInt(req.auth.user_id)).then(user => {
                        if (!user) {
                            throw new Error('User not found');
                        }
                        if (!verifyPassword(req.body.currentPassword, user.password)) {
                            throw new Error('Current Password wrong');
                        }
                        req.user = user;
                        return true;
                    });
                })(req, res, next);
            return
        }
        next();
    }
, function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const userDoc = res.user || User.findById(parseInt(req.auth.user_id)).then((user) => {
        if (!user) {
            return Promise.reject(new Error('User not found'));
        }
        return user;
    });

    userDoc.then((user) => {
        return user.update(req.body).then((userUpdated) => {
            res.status(200).json(omit(userUpdated.toJSON(), EXCLUDE_USER_ATTR));
        });
    }).catch((err) => {
        console.log(err);
        res.status(500).json({error: 'Error', message: 'Some error.'});
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

userRouter.post('/users/forgot', [
    check("email").isEmail().normalizeEmail(),
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    User.findOne({
        where: {
          email: req.body.email,
        }
    }).then((userDoc) => {
      if (!userDoc) {
        return res.status(422).json({errors: [
          {email: 'Email not found.'}
        ]});
      }

      token.generate({
          user_id: userDoc.id
      }, {expiresIn: '2h'}).then((data) => {
          userDoc.update({forgot_token: data}).then(() => {
              mailService.send(userDoc.email, mailService.constants.FORGOT_PASSWORD, {
                  link: `/app/?token=${data}`,
                  username: `${userDoc.firstName} ${userDoc.lastName}`,
              }).then(() => {
                res.status(204).json();
              }).catch((error) => {
                  console.log(error);
                  return res.status(500).json({error: 'Error', message: error.message});
              })
          }).catch((error) => {
              console.log(error);
              return res.status(500).json({error: "Error", message: error.message});
          })
      }).catch(((error) => {
          console.log(error);
          return res.status(500).json({error: "Error", message: error.message});
      }));
    }).catch((error) => {
        console.log(error);
        res.status(500).json({error: "Error", message: "Some error."})
    })
});

userRouter.post('/users/forgot/verify', [
    check('password', 'The password must be 8+ chars long and contain a number')
        .not().isIn(['123456789', '12345678', 'password1']).withMessage('Do not use a common word as the password')
        .isLength({min: 8})
        .matches(/\d/),
    check('password_confirm')
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    check('forgot_token')
        .custom((value, { req }) => {
        return token.verify(value)
            .then((data) => {
                req.token = data;
            })
            .catch((error) => {
                const [, message] = error.message.split(' ');
                throw new Error(`Field 'forgot_token' ${message}`);
            })
        })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    const id = parseInt(req.token.user_id);
    User.findOne({
        where: {
            id,
            forgot_token: req.body.forgot_token
        }
    })
        .then((userDoc) => {
            if (!userDoc) {
                return res.status(404).json({error: "Not Found", message: "User not found"});
            }
            return userDoc.update({
                password: req.body.password,
                forgot_token: null
            }).then((userUpdated) => {
                res.json(omit(userUpdated.toJSON(), EXCLUDE_USER_ATTR));
            })
        }).catch((error) => {
            console.log(error.message);
            res.status(500).json({error: 'Error', message: 'Some error.'});
        });
});

userRouter
    .route('/users/verify')
    .post(function (req, res) {
        User.findById(req.auth.user_id)
            .then((user) => {
                if (!user) {
                    throw new Error('User not found');
                }
                if (user.verify) {
                    throw new Error('User already verified.');
                }
                return token.generate({
                    user_id: user.id,
                    verify: user.verify
                }).then((token) => {
                    return mailService.send(user.email, mailService.constants.VERIFY_USER, {
                        link: `/app/?verifyToken=${token}`,
                        username: `${user.firstName} ${user.lastName}`,
                    }).then(() => {
                        return user.update({
                            verify_token: token
                        }).then(() => {
                            res.status(204).json();
                        });
                    });
                });
            })
            .catch((error) => {
                let message = 'Some error.';
                let status = 500;
                if(error.name === 'Error') {
                    message = error.message;
                    status = 400;
                }
                res.status(status).json({error: 'Error', message});
            });
    })
    .put([
        check('verifyToken').custom((value, {req}) => {
            if (value) {
                return token.verify(value).then(() => {
                    req.verifyToken = value;
                });
            }
        })
    ], function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        User.findOne({
            where: {
                verify_token: req.verifyToken,
                verify: false,
            }
        })
            .then(function (user) {
                if (!user) {
                    throw new Error('User not found');
                }
                return user.update(model.formattingValue({
                    verifyToken: null,
                    verify: true,
                    balance: user.balance + 100
                })).then((user) => {
                    res.json(omit(user.toJSON(), EXCLUDE_USER_ATTR));
                });
            })
            .catch(function (error) {
                let message = 'Some error.';
                let status = 500;
                if (error.name === 'Error') {
                    message = error.message;
                    status = 400;
                }
                res.status(status).json({error: 'Error', message});
            });
    });

module.exports = userRouter;
