const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const BotService = require("../services/botService");
const _ = require("lodash");
const auth = require("../middleware/auth");

router.post(
  "/new",
  [
    celebrate({
      body: {
        instagramUrl: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const newBot = await botService.createBot(req.user, req.body.instagramUrl);

    res.send(newBot);
  }
);

router.delete(
  "/delete",
  [
    celebrate({
      body: {
        instagramUrl: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const bot = await botService.deleteBot(req.user, req.body.instagramUrl);

    res.send(bot);
  }
);

// router.get("/", [auth], async (req, res) => {
//   const userService = new UserService();

//   const userRecord = await userService.getMe(req.user);

//   res.send(_.pick(userRecord, ["name", "email"]));
// });

module.exports = router;
