const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const UserService = require("../services/userService");
const _ = require("lodash");
const auth = require("../middleware/auth");

router.get(
  "/me",
  [
    celebrate({
      body: {
        email: Joi.string().required().min(5).max(255).email(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const userService = new UserService();

    const userRecord = await userService.getMe(req.body);

    res.send(_.pick(userRecord, ["name", "email"]));
  }
);

module.exports = router;
