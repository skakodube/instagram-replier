const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const BotService = require("../services/botService");
const auth = require("../middleware/auth");

//TODO:
//add users searcher by email for invites

router.get("/", [auth], async (req, res) => {
  const botService = new BotService();

  const bots = await botService.getBots(req.user);

  res.send(bots);
});

router.post(
  //TODO:
  //get or post?
  "/replies",
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const replies = await botService.getRepliesByBot(req.user, botId);

    res.send(replies);
  }
);

router.post(
  "/create",
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

    const createdBot = await botService.createBot(
      req.user,
      req.body.instagramUrl
    );

    res.send(createdBot);
  }
);

router.delete(
  "/delete",
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const deletedBot = await botService.deleteBot(req.user, req.body.botId);

    res.send(deletedBot);
  }
);

router.post(
  "/add-reply",
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        keywords: Joi.array().items(Joi.string()).required().min(1),
        reply: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const addedReply = await botService.addReply(
      req.user,
      req.body.botId,
      req.body.keywords,
      req.body.reply
    );

    res.send(addedReply);
  }
);

router.delete(
  "/delete-reply",
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        replyId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const deletedReply = await botService.deleteReply(
      req.user,
      req.body.botId,
      req.body.replyId
    );

    res.send(deletedReply);
  }
);

router.put(
  "/edit-reply",
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        replyId: Joi.objectId().required(),
        keywords: Joi.array().items(Joi.string()).required().min(1),
        reply: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const editedReply = await botService.editReply(
      req.user,
      req.body.botId,
      req.body.replyId,
      req.body.keywords,
      req.body.reply
    );

    res.send(editedReply);
  }
);

router.post(
  "/invite-moderator",
  [
    celebrate({
      body: {
        userToInviteId: Joi.objectId().required(),
        botId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const result = await botService.inviteModerator(
      req.user,
      req.body.userToInviteId,
      req.body.botId
    );

    res.send(result);
  }
);

router.post(
  "/remove-moderator",
  [
    celebrate({
      body: {
        userToInviteId: Joi.objectId().required(),
        botId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    const botService = new BotService();

    const result = await botService.removeModerator(
      req.user,
      req.body.userToInviteId,
      req.body.botId
    );

    res.send(result);
  }
);

module.exports = router;
