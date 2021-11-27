const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity").default;
const UserService = require("../services/userService");
const EmailService = require("../services/emailService");
const jwt = require("../helpers/jwt");
const _ = require("lodash");

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
        verificationLink: Joi.string().required().min(1).max(255),
      },
    }),
  ],
  async (req, res) => {
    const userService = new UserService();
    const user = await userService.signup(req.body);

    const emailService = new EmailService();
    await emailService.sendVerificationEmail(user, req.body.verificationLink);

    res.header("x-auth-token", jwt.generateJWT(user)).send({ user });
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
    const user = await userService.login(req.body);

    res.header("x-auth-token", jwt.generateJWT(user)).send({ user });
  }
);

//=========================RecoverPassword=========================//

router.post(
  "/send-recover-email",
  [
    celebrate({
      body: {
        email: Joi.string().required().min(5).max(255).email(),
        link: Joi.string().required().min(1).max(255),
      },
    }),
  ],
  async (req, res) => {
    const emailService = new EmailService();
    await emailService.sendRecoverPasswordEmail(req.body.email, req.body.link);

    res.send("OK");
  }
);

router.post(
  "/reset-password",
  [
    celebrate({
      body: {
        token: Joi.string().required(),
        password: passwordComplexity({
          min: 5,
          max: 255,
          lowerCase: 0,
          upperCase: 0,
          numeric: 0,
          symbol: 0,
          requirementCount: 2,
        }).required(),
      },
    }),
  ],
  async (req, res) => {
    const userService = new UserService();

    await userService.resetPasswordByEmailtoken(
      req.body.token,
      req.body.password
    );

    res.send("OK");
  }
);

module.exports = router;
