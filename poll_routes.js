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
const {events} = require('lumeos_utils');
const {UploadService} = require('lumeos_services');

const dbSetup = require("./db_setup.js");
const sequelize = dbSetup.dbInstance;

const db_entities = require("./db_entities.js");
var User = db_entities.User;
var Poll = db_entities.Poll;
var Result = db_entities.Result;
var Transaction = db_entities.Transaction;
const getProfileImage = db_entities.getProfileImage;

var util = require("./utilities.js");
const removeEmpty = util.removeEmpty;

// in prod we use postgress, which requires iLike to case insensitive.
// sqlite does not support iLike operator
const likeOp = (process.env.ENV_PRODUCTION && process.env.LUMEOS_SERVER_DB) ? Op.iLike : Op.like;

var pollRouter = express.Router();

// I am sure there is more clever way of doing this
function updatePollPrice(poll) {
  const participantCount = poll['participant_count'] + 1;
  let newPrice = 0;
  if (participantCount >= 1000) {
    newPrice = 1000;
  } else if (participantCount >= 250) {
    newPrice = 250;
  } else if (participantCount >= 100) {
    newPrice = 100;
  } else if (participantCount >= 50) {
    newPrice = 50;
  } else if (participantCount >= 1) {
    newPrice = 10;
  }
  poll.update({price: newPrice});
}

pollRouter.post('/polls', UploadService.middleware('avatar'), [
    check("question").not().isEmpty().trim().withMessage("Field 'question' cannot be empty"),
    check("answers").isArray().withMessage("Field 'answers' must be an array."),
    check("tags").optional().isArray().withMessage("Field 'tags' must be an array."),
    check("creator_id").custom((value, {req}) => {
      if (typeof req.user.user_id === "undefined") {
          throw new Error("Field 'creator_id' must be.")
      }
      req.body.creator_id = req.user.user_id;
      return true
    }),
    check("avatar").custom((value, {req}) => {
      if (typeof req.file === "undefined") {
        throw new Error("Field 'avatar' must be image.")
      }
      return true;
    })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    sequelize.sync()
      .then(() => {
        return UploadService.upload(req.file).then(({file}) => {
          Object.assign(req.body, {avatar: file});
            return Poll
                .build(req.body)
                .save()
                .then(poll => {
                    poll.setDataValue('poll_id', poll.id);
                    res.json(removeEmpty(poll));
                });
        });
      }).catch((error) => {
        console.log(error);
        res.status(500).json({error: "Error", message: "Some error."})
    })
  });

pollRouter.get('/polls/:id', function (req, res) {
  Poll.find({
    where: {
      id: parseInt(req.params["id"])
    },
    attributes: [
      ["id", "poll_id"],
      "question",
      "answers",
      "tags",
      "participant_count",
      "price",
      "creator_id",
      "createdAt"
    ]
  }).then(poll => {
    if (poll) {
      getProfileImage(poll["creator_id"]).then(result => {
        poll.dataValues["creator_image"] = result;

        if (req.query["isAnswered"]) {
          poll.dataValues["is_answered"] = 0;
          Result.findOne({
            where: {
              user_id: parseInt(req.query["isAnswered"]),
              poll_id: parseInt(req.params["id"])
            },
            attributes: ["poll_id"]
          }).then(result => {
            if (result) {
              poll.dataValues["is_answered"] = 1;
            }
            res.json(removeEmpty(poll));
          }).catch(error => {
            console.log("I guess this is a first vote ever? user_id: " + req.query["isAnswered"] + ", poll_id: " + req.param["id"]);
            console.log(error);
            res.json(removeEmpty(poll));
          });
        } else if (req.query["isBought"]) {
          poll.dataValues["is_bought"] = 0;
          Transaction.findOne({
            where: {
              user_id: parseInt(req.query["isBought"]),
              poll_id: parseInt(req.params["id"])
            },
            attributes: ["poll_id"]
          }).then(result => {
            if (result) {
              poll.dataValues["is_bought"] = 1;
            }
            res.json(removeEmpty(poll));
          }).catch(error => {
            console.log("I guess this is a first vote ever? user_id: " + req.query["isBought"] + ", poll_id: " + req.param["id"]);
            console.log(error);
            res.json(removeEmpty(poll));
          });
        } else {
          res.json(removeEmpty(poll));
        }
      });
    } else {
      res.status(404).json({error: "Not Found", message: "Poll not found"})
    }
  })
});

pollRouter.get('/polls', function (req, res) {
  var where_params = [];
  let orderParams = [];
  let limit = 10e3;
  if (req.query["orderBy"]) {
    orderParams.push([sequelize.col(req.query["orderBy"]), 'DESC'])
  }
  if (req.query["limit"]) {
    limit = req.query["limit"];
  }
  if (req.query["queryCreator"]) {
    where_params.push({
      creator_id: req.query["queryCreator"]
    });
  }
  if (req.query["queryQuestion"]) {
    where_params.push({
      question: {[likeOp]: "%" + req.query["queryQuestion"] + "%"}
    });
  }
  if (req.query["queryTag"]) {
    where_params.push({
      tags: {[likeOp]: "%" + req.query["queryTag"] + "%"}
    });
  }
  var where_object = {};
  where_attributes = [["id", "poll_id"], "question", "answers", "tags", "participant_count", "price", "creator_id", "createdAt"];
  if (req.query["queryParticipant"]) {
    Result.findAll({
      where: {user_id: parseInt(req.query["queryParticipant"])},
      attributes: ["poll_id"]
    }).then(result => {
      if (!Array.isArray(result) || !result.length) {
          res.json(removeEmpty([]));
          // res.status(404).json({error: "Not Found", message: "Poll not found"})
      } else {
        where_params.push({
          id: {[Op.or]: result.map(x => x.dataValues["poll_id"])}
        });
        where_object = {where: Object.assign({}, ...where_params)};
        where_object.attributes = where_attributes;
        Poll.findAll(where_object).then(poll => {
          if (poll) {
            Promise.all(poll.map(x => getProfileImage(x["creator_id"]))).then(result => {
              poll.map((elem, index) => elem.dataValues["creator_image"] = result[index]);
              res.json(removeEmpty(poll));
            });
          } else {
            res.status(200).json([]);
            // res.status(404).json({error: "Not Found", message: "Poll not found"})
          }
        })
      }
    })
  } else {
    where_object = {where: Object.assign({}, ...where_params), order: orderParams, limit: limit};
    where_object.attributes = where_attributes;
    Poll.findAll(where_object).then(poll => {
      if (poll) {
        // TODO: This is bad, we get profile images for all, and only then filter, invert.
        Promise.all(poll.map(x => getProfileImage(x["creator_id"]))).then(result => {
          poll.map((elem, index) => elem.dataValues["creator_image"] = result[index]);

          if (req.query["queryFeatured"] || req.query["isAnswered"]) {
            const callerId = req.query["queryFeatured"] ? parseInt(req.query["queryFeatured"]) : parseInt(req.query["isAnswered"]);
            Result.findAll({
              where: {user_id: parseInt(callerId)},
              attributes: ["poll_id"]
            }).then(participated => {
              if (!Array.isArray(participated) || !participated.length) {
                participated = [];
              }
              participated = new Set(participated.map(x => x.dataValues["poll_id"]));
              if (req.query["queryFeatured"]) {
                // We queryed all polls user participated, and exclude it from the final list.
                poll = poll.filter(element => !participated.has(element.dataValues["poll_id"]) &&
                  (callerId !== element.dataValues["creator_id"]));
                res.json(removeEmpty(poll));
              } else {
                poll = poll.filter(element => {
                  if (participated.has(element.dataValues["poll_id"])) {
                    element.dataValues["is_answered"] = 1;
                  } else {
                    element.dataValues["is_answered"] = 0;
                  }

                  return element;
                });
                res.json(removeEmpty(poll));
              }
            });
          } else {
            res.json(removeEmpty(poll));
          }
        });
      }
      else {
        res.status(404).json({error: "Not Found", message: "Poll not found"})
      }
    }).catch(error => {
      res.status(404).json({error: "Not Found", message: "poll table doesn't exist: " + error})
    });
  }
});

pollRouter.post('/polls/:poll_id', [
  check("user_id").isInt().withMessage("Field 'user_id' must be an int."),
  check("answer").isInt().withMessage("Field 'answer' must be an int.")
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  const userId = parseInt(req.body["user_id"]);
  User.findById(userId).then(user => {
    if (user) {
      sequelize.sync()
        .then(() => {
          Poll.findById(parseInt(req.params["poll_id"])).then(poll => {
            if (poll) {
              const clientAnswer = parseInt(req.body["answer"]);
              if ((poll["answers"].length <= clientAnswer) || (clientAnswer < 0)) {
                res.status(400).json({error: "Invalid Input", message: "Answer choice specified is invalid."});
                return;
              }
              Result.findOrCreate({
                where: {
                  poll_id: parseInt(poll["id"]),
                  user_id: userId
                }
              }).spread((result, created) => {
                if (created) {
                  result.update({answer: req.body["answer"]}).then(resultNext => {
                    poll.increment('participant_count');
                    User.increment({answer_count: 1, balance: 5}, {where: {id: userId}});
                    /**
                     * create notification
                     */
                    User.findById(parseInt(poll.creator_id)).then((user) => {
                        events.emit(events.constants.sendAnswerForPoll, {
                            all_notifications: user.all_notifications,
                            target_user_id: parseInt(poll.creator_id),
                            from_user_id: parseInt(user.id),
                            nickname: `${user.firstName} ${user.lastName}`
                        });
                    });
                    //updatePollPrice(poll); // TODO: Uncomment once we decide to charge people
                    res.status(204).json();
                  }).catch(error => {
                    result.destroy();
                    console.log(error);
                  })
                } else {
                  res.status(400).json({error: "Bad Request", message: "User already voted in this poll"})
                }
              })
            } else {
              res.status(404).json({error: "Not Found", message: "Poll not found"})
            }
          })
        })
    }
    else {
      res.status(404).json({error: "Not Found", message: "User not found"})
    }
  }).catch(error => {
    console.log(error);
    res.status(404).json({error: "Not Found", message: "Users table doesn't exist"})
  });
});

pollRouter.post('/polls/:poll_id/results', function (req, res) {
  sequelize.sync()
    .then(() => {
      var pollId = parseInt(req.params["poll_id"]);
      Poll.findById(pollId).then(poll => {
        if (poll) {
          var temp = [];
          poll["answers"].forEach(element => {
            temp.push([element, 0]);
          });
          Result.findAll({where: {poll_id: pollId}}).then(results => {
            results.forEach(element => {
              temp[parseInt(element["answer"])] = [temp[parseInt(element["answer"])][0], temp[parseInt(element["answer"])][1] + 1];
            })
          }).then(() => {

            User.findById(parseInt(req.body['user_id'])).then(user => {
              if (user) {
                Transaction.findOrCreate({
                  where: {
                    poll_id: parseInt(poll["id"]),
                    user_id: parseInt(req.body["user_id"])
                  }
                }).spread((transaction, created) => {
                  if (created) {
                    // have to check here, because its ok for user to see poll after he bough it, and have zero balance
                    if (user["balance"] < poll["price"]) {
                      res.status(404).json({error: "Bad request", message: "Not enough assets to buy a poll."});
                      return;
                    }
                    user.decrement("balance", {by: poll["price"]});

                    /**
                     * create notifications
                     */
                    User.findById(parseInt(poll.creator_id)).then((user) => {
                        events.emit(events.constants.sendResultForPoll, {
                            all_notifications: user.all_notifications,
                            target_user_id: poll.creator_id,
                            from_user_id: user.id,
                            nickname: `${user.firstName} ${user.lastName}`
                        })
                    });
                    /* Thats how we actually should do it. Instead of giving for answers.
                    leave for later
                    Result.findAll({
                      where: {poll_id: parseInt(poll["id"])},
                      attributes: ["user_id"]
                    }).then(users => {
                        users = users.map(x => x.dataValues["user_id"]);
                        const DEFAULT_LUME = 5; // this is random number, for first week launch
                        User.increment('balance', { by: DEFAULT_LUME, where: { id: {[Op.in] : users} } });
                    })
                    */
                    // TODO: In blockchain we will be sending amount to reserve account.
                  }

                  // if building this fails, its fine, user not goint to charged for subsequent requirests
                  var answers = {};
                  temp.forEach(element => {
                    answers[element[0]] = element[1];
                  });

                  res.json({
                    poll_id: poll["id"],
                    question: poll["question"],
                    answers: answers
                  });

                }) // Transaction
              } else {
                res.status(404).json({error: "Not Found", message: "User not found"})
              }
            }); // User

          }) // Poll
        } else { // if poll
          res.status(404).json({error: "Not Found", message: "Poll not found"})
        }
      }).catch(error => {
        res.status(404).json({error: "Not Found", message: "Poll table doesn't exist"})
      });
    })
});

module.exports = pollRouter;
