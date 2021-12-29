const express = require('express');
const router = express.Router();
const { celebrate, Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);
const BotService = require('../services/botService');
const auth = require('../middleware/auth');
const logger = require('../loaders/logging');

//TODO:
//add users searcher by email for invites
//SEND DATA OR OK?
//VERIFICATION MUST BE MIDDLEWARE

router.get('/', [auth], async (req, res) => {
  logger.debug('Calling Get-Bots endpoint');
  const botService = new BotService();

  const userAndBots = await botService.getBots(req.user);

  res.send({ user: userAndBots });
});

router.post(
  '/',
  [
    celebrate({
      body: {
        instagramUrl: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Create-Bot endpoint with body: ' + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const instagramUrl = req.body.instagramUrl;
    const credentials = {
      username: req.body.username,
      password: req.body.password,
    };

    const bot = await botService.createBot(req.user, {
      instagramUrl,
      credentials,
    });

    res.send({ bot });
  }
);

router.patch(
  '/isActive',
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        isActive: Joi.boolean().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Patch-active endpoint with body: ' + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.changeBotActive(
      req.user,
      req.body.botId,
      req.body.isActive
    );

    res.send({ bot });
  }
);

router.patch(
  '/credentials',
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        username: Joi.string().required(),
        password: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Patch-credentials endpoint with body: ' +
        JSON.stringify(req.body)
    );
    const botService = new BotService();
    const credentials = {
      username: req.body.username,
      password: req.body.password,
    };
    const bot = await botService.changeCredentials(
      req.user,
      req.body.botId,
      credentials
    );

    res.send({ bot });
  }
);

router.delete(
  '/',
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
      'Calling Delete-Bot endpoint with body: ' + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.deleteBot(req.user, req.body.botId);

    res.send({ bot });
  }
);

//=========================Replies=========================//

router.get(
  //TODO:
  // PUT PAGENUM AND PAGESIZE IN URL
  //get or post?
  '/reply',
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
      'Calling Get-Replies endpoint with body: ' + JSON.stringify(req.body)
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
  '/reply',
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        keywords: Joi.array().items(Joi.string()).required().min(1),
        answer: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Create-Reply endpoint with body: ' + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const reply = await botService.addReply(
      req.user,
      req.body.botId,
      req.body.keywords,
      req.body.answer
    );

    res.send({ reply });
  }
);

router.patch(
  '/reply',
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        replyId: Joi.objectId().required(),
        keywords: Joi.array().items(Joi.string()).required().min(1),
        answer: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Patch-Reply endpoint with body: ' + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const reply = await botService.editReply(
      req.user,
      req.body.botId,
      req.body.replyId,
      req.body.keywords,
      req.body.answer
    );

    res.send({ reply });
  }
);

router.patch(
  '/reply/isActive',
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        replyId: Joi.objectId().required(),
        isActive: Joi.boolean().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Patch-reply-active endpoint with body: ' +
        JSON.stringify(req.body)
    );
    const botService = new BotService();

    const reply = await botService.changeBotActive(
      req.user,
      req.body.botId,
      req.body.repplyId,
      req.body.isActive
    );

    res.send({ reply });
  }
);

router.delete(
  '/reply',
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
      'Calling Delete-Reply endpoint with body: ' + JSON.stringify(req.body)
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

router.put(
  '/default-reply',
  [
    celebrate({
      body: {
        botId: Joi.objectId().required(),
        defaultReply: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Delete-Reply endpoint with body: ' + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.editDefaultReply(
      req.user,
      req.body.botId,
      req.body.defaultReply
    );

    res.send({ bot });
  }
);

//=========================Moderators=========================//

router.patch(
  '/invite-moderator',
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
      'Calling Invite-Moderator endpoint with body: ' + JSON.stringify(req.body)
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
  '/remove-moderator',
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
      'Calling Remove-Moderator endpoint with body: ' + JSON.stringify(req.body)
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
