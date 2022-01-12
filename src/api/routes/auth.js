const express = require('express');
const router = express.Router();
const { celebrate, Joi, Segments } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);
const passwordComplexity = require('joi-password-complexity').default;
const UserService = require('../services/userService');
const EmailService = require('../services/emailService');
const jwt = require('../helpers/jwt');
const logger = require('../loaders/logging');

router.post(
  '/login',
  [
    celebrate({
      [Segments.BODY]: {
        email: Joi.string().required().min(5).max(255).email(),
        password: Joi.string().required().min(5).max(255),
      },
    }),
  ],
  async (req, res) => {
    logger.debug(
      'Calling Log-in endpoint with data: ' + JSON.stringify(req.body)
    );
    const userService = new UserService();
    const user = await userService.login(req.body);

    if (!user.isVerified) {
      logger.silly(
        'Sending verification email : ' + JSON.stringify(req.body.email)
      );
      const emailService = new EmailService();
      await emailService.sendVerificationEmail(
        user.email,
        req.body.verificationLink
      );
    }

    res.header('x-auth-token', jwt.generateJWT(user)).send({ user });
  }
);

router.post(
  '/signup',
  [
    celebrate({
      [Segments.BODY]: {
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
        verificationLink: Joi.string().required().min(1).max(255),
      },
    }),
  ],
  async (req, res) => {
    logger.debug(
      'Calling Log-in endpoint with data: ' + JSON.stringify(req.body)
    );
    const userService = new UserService();
    const user = await userService.signup(req.body);

    logger.silly(
      'Sending verification email : ' + JSON.stringify(req.body.email)
    );
    const emailService = new EmailService();
    await emailService.sendVerificationEmail(
      user.email,
      req.body.verificationLink
    );

    res.header('x-auth-token', jwt.generateJWT(user)).send({ user });
  }
);

module.exports = router;
