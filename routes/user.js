const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const UserService = require("../services/userService");
const EmailService = require("../services/emailService");
const _ = require("lodash");
const auth = require("../middleware/auth");

//TODO format links to dash look

router.get("/me", [auth], async (req, res) => {
  const userService = new UserService();

  const userRecord = await userService.getMe(req.user);

  res.send(userRecord);
});

router.post("/send-verify-email", [auth], async (req, res) => {
  const emailService = new EmailService();

  await emailService.sendVerificationEmail(req.user);

  res.send("OK");
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

    userEdited = await userService.edit(
      req.user,
      req.body.firstName,
      req.body.lastName
    );

    res.send(userEdited);
  }
);

router.post("/activate-account", [auth], async (req, res) => {
  const userService = new UserService();

  verifiedStatus = await userService.activateAccount(req.user);

  res.send(verifiedStatus);
});

module.exports = router;
