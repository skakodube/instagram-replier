const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const UserService = require("../services/userService");
const EmailService = require("../services/emailService");
const _ = require("lodash");
const auth = require("../middleware/auth");

router.get("/me", [auth], async (req, res) => {
  const userService = new UserService();

  const userRecord = await userService.getMe(req.user);

  res.send(userRecord);
});

router.post("/sendVerifyEmail", [auth], async (req, res) => {
  const emailService = new EmailService();

  await emailService.sendVerificationEmail(req.user);

  res.send("OK");
});

router.post("/verify", [auth], async (req, res) => {
  const userService = new UserService();

  verifiedStatus = await userService.verify(req.user);

  res.send({ verifiedStatus: verifiedStatus });
});

module.exports = router;
