const express = require('express');
const router = express.Router();
const { celebrate, Joi, Segments } = require('celebrate');
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
      [Segments.BODY]: {
        username: Joi.string().required(),
        password: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Create-Bot endpoint with data: ' + JSON.stringify(req.body)
    );
    const botService = new BotService();

    const credentials = {
      username: req.body.username,
      password: req.body.password,
    };

    const bot = await botService.createBot(req.user, credentials);

    res.send({ bot });
  }
);

router.patch(
  '/:botId/isActive',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
      },
      [Segments.BODY]: {
        isActive: Joi.boolean().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Patch-active endpoint with data: ' +
        JSON.stringify(req.params) +
        JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.changeBotActive(
      req.user,
      req.params.botId,
      req.body.isActive
    );

    res.send({ bot });
  }
);

router.patch(
  '/:botId/credentials',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
      },
      [Segments.BODY]: {
        username: Joi.string().required(),
        password: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Patch-credentials endpoint with data: ' +
        JSON.stringify(req.params) +
        JSON.stringify(req.body)
    );
    const botService = new BotService();
    const credentials = {
      username: req.body.username,
      password: req.body.password,
    };
    const instagramUrl = `https://www.instagram.com/${req.body.username}`;
    const bot = await botService.changeCredentials(
      req.user,
      req.params.botId,
      credentials,
      instagramUrl
    );

    res.send({ bot });
  }
);

router.delete(
  '/:botId',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Delete-Bot endpoint with data: ' + JSON.stringify(req.params)
    );
    const botService = new BotService();

    const bot = await botService.deleteBot(req.user, req.params.botId);

    res.send({ bot });
  }
);

//=========================Replies=========================//

router.get(
  '/:botId/reply',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
      },
      [Segments.QUERY]: {
        pageNum: Joi.number().required().min(1),
        pageSize: Joi.number().required().min(1),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Get-Replies endpoint with data: ' +
        JSON.stringify(req.params) +
        JSON.stringify(req.query)
    );
    const botService = new BotService();

    const botAndReplies = await botService.getRepliesByBot(
      req.user,
      req.params.botId,
      req.query.pageNum,
      req.query.pageSize
    );

    res.send({ bot: botAndReplies });
  }
);

router.post(
  '/:botId/reply',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
      },
      [Segments.BODY]: {
        keywords: Joi.array().items(Joi.string()).required().min(1),
        answer: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Create-Reply endpoint with data: ' +
        JSON.stringify(req.params) +
        JSON.stringify(req.body)
    );
    const botService = new BotService();

    const reply = await botService.addReply(
      req.user,
      req.params.botId,
      req.body.keywords,
      req.body.answer
    );

    res.send({ reply });
  }
);

router.patch(
  '/:botId/reply/:replyId',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
        replyId: Joi.objectId().required(),
      },
      [Segments.BODY]: {
        keywords: Joi.array().items(Joi.string()).required().min(1),
        answer: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Patch-Reply endpoint with data: ' +
        JSON.stringify(req.params) +
        JSON.stringify(req.body)
    );
    const botService = new BotService();

    const reply = await botService.editReply(
      req.user,
      req.params.botId,
      req.params.replyId,
      req.body.keywords,
      req.body.answer
    );

    res.send({ reply });
  }
);

router.patch(
  '/:botId/reply/:replyId/isActive',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
        replyId: Joi.objectId().required(),
      },
      [Segments.BODY]: {
        isActive: Joi.boolean().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Patch-reply-active endpoint with data: ' +
        JSON.stringify(req.params) +
        JSON.stringify(req.body)
    );
    const botService = new BotService();

    const reply = await botService.changeReplyActive(
      req.user,
      req.params.botId,
      req.params.replyId,
      req.body.isActive
    );

    res.send({ reply });
  }
);

router.delete(
  '/:botId/reply/:replyId',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
        replyId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Delete-Reply endpoint with data: ' + JSON.stringify(req.params)
    );
    const botService = new BotService();

    const reply = await botService.deleteReply(
      req.user,
      req.params.botId,
      req.params.replyId
    );

    res.send({ reply });
  }
);

router.patch(
  '/:botId/default-reply',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
      },
      [Segments.BODY]: {
        defaultReply: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Delete-Reply endpoint with data: ' +
        JSON.stringify(req.params) +
        JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.editDefaultReply(
      req.user,
      req.params.botId,
      req.body.defaultReply
    );

    res.send({ bot });
  }
);

//=========================Moderators=========================//

router.patch(
  '/:botId/invite-moderator',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
      },
      [Segments.BODY]: {
        userToInviteEmail: Joi.string().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Invite-Moderator endpoint with data: ' +
        JSON.stringify(req.params) +
        JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.inviteModerator(
      req.user,
      req.body.userToInviteEmail,
      req.params.botId
    );

    res.send({ bot });
  }
);

router.patch(
  '/:botId/remove-moderator',
  [
    celebrate({
      [Segments.PARAMS]: {
        botId: Joi.objectId().required(),
      },
      [Segments.BODY]: {
        userToRemoveId: Joi.objectId().required(),
      },
    }),
    auth,
  ],
  async (req, res) => {
    logger.debug(
      'Calling Remove-Moderator endpoint with data: ' +
        JSON.stringify(req.params) +
        JSON.stringify(req.body)
    );
    const botService = new BotService();

    const bot = await botService.removeModerator(
      req.user,
      req.body.userToRemoveId,
      req.params.botId
    );

    res.send({ bot });
  }
);

module.exports = router;
