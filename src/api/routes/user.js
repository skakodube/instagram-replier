const express = require('express');
const router = express.Router();
const { celebrate, Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);
const UserService = require('../services/userService');
const passwordComplexity = require('joi-password-complexity').default;
const EmailService = require('../services/emailService');
const auth = require('../middleware/auth');
const jwt = require('../helpers/jwt');
const _ = require('lodash');
const logger = require('../loaders/logging');

//TODO: REMOVE AWAIT ON EMAILING

// router.get("/me", [auth], async (req, res) => {
//   const userService = new UserService();

//   const userRecord = await userService.getMe(req.user);

//   res.header("x-auth-token", jwt.generateJWT(userRecord)).send(userRecord);
// });

//refactor to change single chosen parameter?
//
router.put(
  '/',
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
    logger.debug(
      'Calling Edit-User endpoint with body: ' + JSON.stringify(req.body)
    );
    const userService = new UserService();

    user = await userService.edit(
      req.user,
      req.body.firstName,
      req.body.lastName
    );

    res.header('x-auth-token', jwt.generateJWT(user)).send({ user });
  }
);

router.patch(
  '/reset-password',
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
    logger.debug(
      'Calling Reset-Password endpoint with body: ' + JSON.stringify(req.body)
    );
    const userService = new UserService();
    await userService.resetPasswordByPassword(
      req.user,
      req.body.oldPassword,
      req.body.newPassword
    );
    res.send('OK');
  }
);

router.patch(
  '/change-email',
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
    logger.debug(
      'Calling Change-Email endpoint with body: ' + JSON.stringify(req.body)
    );
    const userService = new UserService();
    const { user, oldEmail } = await userService.changeEmail(
      req.user,
      req.body.newEmail,
      req.body.password
    );
    logger.silly('Sending notice email to : ' + JSON.stringify(oldEmail));
    const emailService = new EmailService();
    await emailService.sendChangeNoticeEmail(user.email, oldEmail);

    res.header('x-auth-token', jwt.generateJWT(user)).send({ user });
  }
);

//=========================AccountVerification=========================//
router.get(
  '/send-activate-email',
  [
    celebrate({
      body: {
        link: Joi.string().required().min(1).max(255),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Send-Activate-Email endpoint with body: ' +
        JSON.stringify(req.body)
    );
    const emailService = new EmailService();
    logger.silly(
      'Sending verification email to: ' + JSON.stringify(req.user.email)
    );
    await emailService.sendVerificationEmail(req.user.email, req.body.link);

    res.send('OK');
  }
);

router.patch(
  '/activate-account',
  [
    celebrate({
      body: {
        token: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Activate-Account endpoint with body: ' + JSON.stringify(req.body)
    );
    const userService = new UserService();

    const user = await userService.activateAccount(req.user, req.body.token);

    res.header('x-auth-token', jwt.generateJWT(user)).send({ user });
  }
);

//=========================RecoverPassword=========================//

router.get(
  '/send-recover-email',
  [
    celebrate({
      body: {
        email: Joi.string().required().min(5).max(255).email(),
        link: Joi.string().required().min(1).max(255),
      },
    }),
  ],
  async (req, res) => {
    logger.debug(
      'Calling Send-Recover-Email endpoint with body: ' +
        JSON.stringify(req.body)
    );
    logger.silly(
      'Sending recover passwor email to: ' + JSON.stringify(req.body.email)
    );
    const emailService = new EmailService();
    await emailService.sendRecoverPasswordEmail(req.body.email, req.body.link);

    res.send('OK');
  }
);

router.patch(
  '/recover-password',
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
    logger.debug(
      'Calling Recover-Password endpoint with body: ' + JSON.stringify(req.body)
    );
    const userService = new UserService();

    await userService.recoverPasswordByEmailtoken(
      req.body.token,
      req.body.password
    );

    res.send('OK');
  }
);

module.exports = router;
