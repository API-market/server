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

const dbSetup = require("./db_setup.js");
const sequelize = dbSetup.dbInstance;

const db_entities = require("./db_entities.js");
var User = db_entities.User;
var Poll = db_entities.Poll;
var Result = db_entities.Result;
var Transaction = db_entities.Transaction;

var util = require("./utilities.js");
const removeEmpty = util.removeEmpty;

const populateCreatorImage = (sequelizeObj) => {
  return sequelizeObj.dataValues["creator_image"] = "/v" + require("./server_info.js").VERSION + "/profile_images/" + sequelizeObj["creator_id"];
}

var pollRouter = express.Router();

pollRouter.post('/polls', [
    check("question").not().isEmpty().trim().withMessage("Field 'question' cannot be empty"),
    check("answers").isArray().withMessage("Field 'answers' must be an array."),
    check("tags").optional().isArray().withMessage("Field 'tags' must be an array."),
    check("creator_id").isInt().withMessage("Field 'creator_id' must be an int."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    sequelize.sync()
      .then(() => {
        Poll
          .build(req.body)
          .save()
          .then(poll => {
            res.json({poll_id: poll["id"]});
          })
          .catch(error => {
            console.log(error);
          })
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
      // this is strange, but mobile is lazy.
      populateCreatorImage(poll);

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
    } else {
      res.status(404).json({error: "Not Found", message: "Poll not found"})
    }
  })
});

pollRouter.get('/polls', function (req, res) {
  var where_params = [];
  if (req.query["queryCreator"]) {
    where_params.push({
      creator_id: req.query["queryCreator"]
    });
  }
  if (req.query["queryQuestion"]) {
    where_params.push({
      question: {[Op.like]: "%" + req.query["queryQuestion"] + "%"}
    });
  }
  if (req.query["queryTag"]) {
    where_params.push({
      tags: {[Op.like]: "%" + req.query["queryTag"] + "%"}
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
        res.status(404).json({error: "Not Found", message: "Poll not found"})
      } else {
        where_params.push({
          id: {[Op.or]: result.map(x => x.dataValues["poll_id"])}
        });
        where_object = {where: Object.assign({}, ...where_params)};
        where_object.attributes = where_attributes;
        Poll.findAll(where_object).then(poll => {
          if (poll) {
            // this is strange, but mobile is lazy.
            poll.forEach(function (element) {
              populateCreatorImage(element);
            });
            res.json(removeEmpty(poll));
          } else {
            res.status(404).json({error: "Not Found", message: "Poll not found"})
          }
        })
      }
    })
  } else {
    where_object = {where: Object.assign({}, ...where_params)};
    where_object.attributes = where_attributes;
    Poll.findAll(where_object).then(poll => {
      if (poll) {
        poll.forEach(function (element) {
          populateCreatorImage(element);
        });

        if (req.query["queryFeatured"]) {
          // We will query all polls user participated, and exclude it from the final list.
          const featuredId = parseInt(req.query["queryFeatured"]);
          Result.findAll({
            where: {user_id: parseInt(featuredId)},
            attributes: ["poll_id"]
          }).then(result => {
            if (!Array.isArray(result) || !result.length) {
              result = [];
            }
            result = new Set(result.map(x => x.dataValues["poll_id"]));
            poll = poll.filter(element => !result.has(element.dataValues["poll_id"]) &&
              (featuredId !== element.dataValues["creator_id"]));
            res.json(removeEmpty(poll));
          })
        } else {
          res.json(removeEmpty(poll));
        }
      }
      else {
        res.status(404).json({error: "Not Found", message: "Poll not found"})
      }
    }).catch(error => {
      res.status(404).json({error: "Not Found", message: "poll table doesn't exist"})
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
  User.findById(parseInt(req.body["user_id"])).then(user => {
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
                  user_id: parseInt(req.body["user_id"])
                }
              }).spread((result, created) => {
                if (created) {
                  result.update({answer: req.body["answer"]}).then(resultNext => {
                    poll.increment('participant_count');
                    poll.increment('price', {by: 0.01});
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
