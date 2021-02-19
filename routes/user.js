const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const UserService = require("../services/userService");
const passwordComplexity = require("joi-password-complexity").default;
const EmailService = require("../services/emailService");
const auth = require("../middleware/auth");
const jwt = require("../helpers/jwt");
const _ = require("lodash");

router.get("/me", [auth], async (req, res) => {
  const userService = new UserService();

  const userRecord = await userService.getMe(req.user);

  res.send(userRecord);
});

router.put(
  "/edit",
  [
    celebrate({
      body: {
        firstName: Joi.string().required().max(50).min(2),
        lastName: Joi.string().required().max(50).min(2),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const userService = new UserService();

    user = await userService.edit(
      req.user,
      req.body.firstName,
      req.body.lastName
    );

    res.header("x-auth-token", jwt.generateJWT(user)).send({ user });
  }
);

//=========================AccountVerification=========================//

router.post(
  "/send-verify-email",
  [
    celebrate({
      body: {
        link: Joi.string().required().min(1).max(255),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const emailService = new EmailService();

    await emailService.sendVerificationEmail(req.user, req.body.link);

    res.send("OK");
  }
);

router.post(
  "/activate-account",
  [
    celebrate({
      body: {
        token: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const userService = new UserService();

    const user = await userService.activateAccount(req.user, req.body.token);

    res.send({ user });
  }
);

//=========================ResetPassword=========================//

router.post(
  "/reset-password",
  [
    celebrate({
      body: {
        oldPassword: passwordComplexity({
          min: 5,
          max: 255,
          lowerCase: 0,
          upperCase: 0,
          numeric: 0,
          symbol: 0,
          requirementCount: 2,
        }).required(),
        newPassword: passwordComplexity({
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
    auth,
  ],
  async (req, res) => {
    const userService = new UserService();
    await userService.resetPasswordByPassword(
      req.user,
      req.body.oldPassword,
      req.body.newPassword
    );
    res.send("OK");
  }
);

//=========================ChangeEmail=========================//

router.post(
  "/send-change-notice-emails",
  [
    celebrate({
      body: {
        password: passwordComplexity({
          min: 5,
          max: 255,
          lowerCase: 0,
          upperCase: 0,
          numeric: 0,
          symbol: 0,
          requirementCount: 2,
        }).required(),
        newEmail: Joi.string().required().min(5).max(255).email(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const emailService = new EmailService();
    await emailService.sendChangeAndNoticeEmails(
      req.user,
      req.body.password,
      req.body.newEmail
    );
    res.send("OK");
  }
);

router.post(
  "/change-email",
  [
    celebrate({
      body: {
        token: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const userService = new UserService();

    const user = await userService.changeEmailByToken(req.user, req.body.token);

    res.header("x-auth-token", jwt.generateJWT(user)).send({ user: user });
  }
);

module.exports = router;
