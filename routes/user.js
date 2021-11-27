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
//TODO: REMOVE AWAIT ON EMAILING
router.get("/me", [auth], async (req, res) => {
  const userService = new UserService();

  const userRecord = await userService.getMe(req.user);

  res.header("x-auth-token", jwt.generateJWT(userRecord)).send(userRecord);
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
//NEW EMAIL IF WASN'T ACTIVATED AT REGISTERING
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

//ACTUALLY ACTIVATE
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

    res.header("x-auth-token", jwt.generateJWT(user)).send({ user });
  }
);

//=========================ResetPassword=========================//

router.put(
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

router.put(
  "/change-email",
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
    const userService = new UserService();
    const data = await userService.changeEmail(
      req.user,
      req.body.newEmail,
      req.body.password
    );

    const emailService = new EmailService();
    await emailService.sendChangeNoticeEmail(data.userRecord, data.oldEmail);

    res.header("x-auth-token", jwt.generateJWT(data.userRecord)).send("OK");
  }
);

module.exports = router;
