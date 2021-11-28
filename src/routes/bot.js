const express = require("express");
const router = express.Router();
const { celebrate, Joi } = require("celebrate");
Joi.objectId = require("joi-objectid")(Joi);
const BotService = require("../services/botService");
const auth = require("../middleware/auth");
const logger = require("../loaders/logging");

//TODO:
//add users searcher by email for invites
//SEND DATA OR OK?
//VERIFICATION MUST BE MIDDLEWARE

router.get("/", [auth], async (req, res) => {
  logger.debug("Calling Get-Bots endpoint");
  const botService = new BotService();

  const userAndBots = await botService.getBots(req.user);

  res.send({ user: userAndBots });
});

router.post(
  "/",
  [
    celebrate({
      body: {
        instagramUrl: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      "Calling Create-Bot endpoint with body: " + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.createBot(req.user, req.body.instagramUrl);

    res.send({ bot });
  }
);

router.delete(
  "/",
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      "Calling Delete-Bot endpoint with body: " + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.deleteBot(req.user, req.body.botId);

    res.send({ bot });
  }
);

//=========================Replies=========================//

router.get(
  //TODO:
  //get or post?
  "/reply",
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        pageNum: Joi.number().min(1).required(),
        pageSize: Joi.number().min(1).required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      "Calling Get-Replies endpoint with body: " + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const botAndReplies = await botService.getRepliesByBot(
      req.user,
      req.body.botId,
      req.body.pageNum,
      req.body.pageSize
    );

    res.send({ bot: botAndReplies });
  }
);

router.post(
  "/reply",
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
    logger.debug(
      "Calling Add-Reply endpoint with body: " + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const reply = await botService.addReply(
      req.user,
      req.body.botId,
      req.body.keywords,
      req.body.reply
    );

    res.send({ reply });
  }
);

router.patch(
  "/reply",
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
    logger.debug(
      "Calling Edit-Reply endpoint with body: " + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const reply = await botService.editReply(
      req.user,
      req.body.botId,
      req.body.replyId,
      req.body.keywords,
      req.body.reply
    );

    res.send({ reply });
  }
);

router.delete(
  "/reply",
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
    logger.debug(
      "Calling Delete-Reply endpoint with body: " + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const reply = await botService.deleteReply(
      req.user,
      req.body.botId,
      req.body.replyId
    );

    res.send({ reply });
  }
);

//=========================Moderators=========================//

router.patch(
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
    logger.debug(
      "Calling Invite-Moderator endpoint with body: " + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.inviteModerator(
      req.user,
      req.body.userToInviteId,
      req.body.botId
    );

    res.send({ bot });
  }
);

router.patch(
  "/remove-moderator",
  [
    celebrate({
      body: {
        userToRemoveId: Joi.objectId().required(),
        botId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      "Calling Remove-Moderator endpoint with body: " + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.removeModerator(
      req.user,
      req.body.userToRemoveId,
      req.body.botId
    );

    res.send({ bot });
  }
);

module.exports = router;
