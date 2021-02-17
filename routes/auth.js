const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity").default;
const UserService = require("../services/userService");
const EmailService = require("../services/emailService");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

//TODO:
//move generateJWTtoken?

router.post(
  "/register",
  [
    celebrate({
      body: {
        firstName: Joi.string().required().max(50).min(2),
        lastName: Joi.string().required().max(50).min(2),
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
    res.header("x-auth-token", token).send(newUserRecord);

    const emailService = new EmailService();

    emailService.sendVerificationEmail(req.body);
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
    res.header("x-auth-token", token).send(loginedUserRecord);
  }
);

function generateJwtToken(user) {
  const token = jwt.sign(
    { email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_PRIVATE_KEY
  );
  return token;
}

router.post(
  "/send-recover-email",
  [
    celebrate({
      body: {
        email: Joi.string().required().min(5).max(255).email(),
      },
    }),
  ],
  async (req, res) => {
    const emailService = new EmailService();
    await emailService.sendRecoverEmail(req.body);
    res.send("OK");
  }
);

router.put(
  "/reset-password",
  //after email
  [
    celebrate({
      body: {
        email: Joi.string().required().min(5).max(255).email(),
        password: Joi.string().required().min(5).max(1024),
      },
    }),
  ],
  async (req, res) => {
    const userService = new UserService();

    await userService.resetPassword(req.body.email, req.body.password);

    res.send("OK");
  }
);

module.exports = router;
