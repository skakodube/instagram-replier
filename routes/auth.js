const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity").default;
const UserService = require("../services/userService");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

router.post(
  "/signup",
  [
    celebrate({
      body: {
        name: Joi.string().required().max(50).min(5),
        email: Joi.string().required().min(5).max(255).email(),
        password: passwordComplexity({
          min: 5,
          max: 255,
          lowerCase: 0,
          upperCase: 0,
          numeric: 0,
          symbol: 0,
          requirementCount: 2,
        }).required(),
        isAdmin: Joi.boolean(),
      },
    }),
  ],
  async (req, res) => {
    const userService = new UserService();
    const newUserRecord = await userService.signup(req.body);

    const token = generateJwtToken(newUserRecord);
    res
      .header("x-auth-token", token)
      .send(_.pick(newUserRecord, ["_id", "name", "email"]));
  }
);

router.post(
  "/login",
  [
    celebrate({
      body: {
        email: Joi.string().required().min(5).max(255).email(),
        password: Joi.string().required().min(5).max(255),
      },
    }),
  ],
  async (req, res) => {
    const userService = new UserService();
    const loginedUserRecord = await userService.login(req.body);

    const token = generateJwtToken(loginedUserRecord);
    res
      .header("x-auth-token", generateJwtToken(token))
      .send(_.pick(loginedUserRecord, ["_id", "name", "email"]));
  }
);

function generateJwtToken(user) {
  const token = jwt.sign(
    { _id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
}

module.exports = router;
