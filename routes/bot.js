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

router.post(
  "/addreply",
  [
    celebrate({
      body: {
        instagramUrl: Joi.string().required(),
        keywords: Joi.array().items(Joi.string()).required().min(1),
        replyText: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const bot = await botService.addReply(
      req.user,
      req.body.instagramUrl,
      req.body.keywords,
      req.body.replyText
    );

    res.send(bot);
  }
);

router.delete(
  "/deletereply",
  [
    celebrate({
      body: {
        instagramUrl: Joi.string().required(),
        replyId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const bot = await botService.deleteReply(
      req.user,
      req.body.instagramUrl,
      req.body.replyId
    );

    res.send(bot);
  }
);

router.put(
  "/modifyreply",
  [
    celebrate({
      body: {
        instagramUrl: Joi.string().required(),
        replyId: Joi.objectId().required(),
        keywords: Joi.array().items(Joi.string()).required().min(1),
        replyText: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const reply = await botService.modifyReply(
      req.user,
      req.body.instagramUrl,
      req.body.replyId,
      req.body.keywords,
      req.body.replyText
    );

    res.send(reply);
  }
);

// router.get("/", [auth], async (req, res) => {
//   const userService = new UserService();

//   const userRecord = await userService.getMe(req.user);

//   res.send(_.pick(userRecord, ["name", "email"]));
// });

module.exports = router;
