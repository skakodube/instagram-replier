const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const UserService = require("../services/userService");
const _ = require("lodash");
const auth = require("../middleware/auth");

router.get("/me", [auth], async (req, res) => {
  const userService = new UserService();

  const userRecord = await userService.getMe(req.user);

  res.send(userRecord);
});

module.exports = router;
