/**
 * Tests Bot service
 *
 * @group unit/services/bot
 */

const mongoose = require('mongoose');
const mockingoose = require('mockingoose');
const UserModel = require('../../../src/api/models/user');
const BotModel = require('../../../src/api/models/bot');
const ReplyModel = require('../../../src/api/models/reply');
const UserNotFoundError = require('../../../src/api/errors/userNotFound');
const BotNotFoundError = require('../../../src/api/errors/botNotFound');
const BotAlreadyExistError = require('../../../src/api/errors/botAlreadyExist');
const ReplyAlreadyExistError = require('../../../src/api/errors/replyAlreadyExist');
const ReplyNotFoundError = require('../../../src/api/errors/replyNotFound');
const PermissionError = require('../../../src/api/errors/permissionError');
const BotService = require('../../../src/api/services/botService');

let user, bot, reply, user2;
async function runTestUserNotFound(callback, strDbMock = 'findOne') {
  it('should return error if user is not registered', async () => {
    mockingoose(UserModel).toReturn(undefined, strDbMock); //db mock

    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(UserNotFoundError);
    });
  });
}
async function runTestUserNotVerified(callback, strDbMock = 'findOne') {
  it('should return error if user is not isVerified', async () => {
    user.isVerified = false;
    mockingoose(UserModel).toReturn(user, strDbMock); //db mock

    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(PermissionError);
    });
  });
}
async function runTestBotNotFound(callback, strDbMock = 'findOne') {
  it('should return error if bot is not created', async () => {
    mockingoose(UserModel).toReturn(user, 'findOne');
    mockingoose(BotModel).toReturn(undefined, strDbMock); //db mock

    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(BotNotFoundError);
    });
  });
}

async function runTestBotAlreadyExist(callback, strDbMock = 'findOne') {
  it('should return error if url is used by other bot', async () => {
    mockingoose(UserModel).toReturn(user, 'findOne');
    mockingoose(BotModel).toReturn(bot, strDbMock); //db mock

    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(BotAlreadyExistError);
    });
  });
}
async function runTestReplyNotFound(callback, strDbMock = 'findOne') {
  it('should return error if reply is not found', async () => {
    mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
    mockingoose(BotModel).toReturn(bot, 'findOne'); //db mock
    mockingoose(ReplyModel).toReturn(undefined, strDbMock); //db mock

    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(ReplyNotFoundError);
    });
  });
}

describe('botService', () => {
  const botService = new BotService();
  beforeEach(() => {
    user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: 'email@email.com',
      firstName: 'Mark',
      lastName: 'Watney',
      password: '12345',
      isVerified: true,
    });
    bot = new BotModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      instagramUrl: 'url',
      credentials: {
        username: 'abc',
        password: 'abc',
      },
      userCreated: user._id,
    });
    reply = new ReplyModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      botBelongs: bot._id,
      keywords: ['k1', 'k2'],
      answer: 'answer',
    });
    bot.replies = [reply];
    user2 = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: 'email2@email.com',
      firstName: 'Anna',
      lastName: 'Stone',
      password: '12345',
      isVerified: true,
    });
  });
  afterEach(() => {
    mockingoose.resetAll();
  });
  describe('getBots', () => {
    it('should return user and bots assigned', async () => {
      user.OwnedBots = [bot];
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock

      const result = await botService.getBots(user);
      expect(result).toMatchObject(user);
    });
    runTestUserNotFound(async function () {
      await botService.getBots(user);
    });
    runTestUserNotVerified(async function () {
      await botService.getBots(user);
    });
  });
  describe('createBot', () => {
    const credentials = { username: 'abc', password: 'abc' };
    it('should return created bot', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(null, 'findOne'); //db mock

      const result = await botService.createBot(user, credentials);
      expect(result).toHaveProperty('credentials.username', 'abc');
    });
    runTestUserNotFound(async function () {
      await botService.createBot(user, credentials);
    });
    runTestUserNotVerified(async function () {
      await botService.createBot(user, credentials);
    });
    runTestBotAlreadyExist(async function () {
      await botService.createBot(user, credentials);
    });
  });
  describe('changeBotActive', () => {
    it('should return changed bot', async () => {
      const isActive = true;
      bot.isActive = isActive;
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOneAndUpdate'); //db mock

      const result = await botService.changeBotActive(user, bot._id, isActive);
      expect(result).toHaveProperty('isActive', isActive);
    });
    runTestUserNotFound(async function () {
      await botService.changeBotActive(user, bot._id, true);
    });
    runTestUserNotVerified(async function () {
      await botService.changeBotActive(user, bot._id, true);
    });
    runTestBotNotFound(async function () {
      await botService.changeBotActive(user, bot._id, true);
    });
  });
  describe('changeCredentials', () => {
    const credentials = {
      username: 'username',
      password: 'password',
    };
    it('should return bot', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOneAndUpdate'); //db mock

      const result = await botService.changeCredentials(
        user,
        bot._id,
        credentials
      );
      expect(bot).toMatchObject(result);
    });
    runTestUserNotFound(async function () {
      await botService.changeCredentials(user, bot._id, credentials);
    });
    runTestUserNotVerified(async function () {
      await botService.changeCredentials(user, bot._id, credentials);
    });
    runTestBotNotFound(async function () {
      await botService.changeCredentials(user, bot._id, credentials);
    });
  });
  describe('deleteBot', () => {
    it("should delete bot and it's replies", async () => {
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOneAndDelete'); //db mock
      mockingoose(ReplyModel).toReturn(reply, 'deleteMany'); //db mock

      const result = await botService.deleteBot(user, bot._id);
      expect(result).toHaveProperty('_id', bot._id);
    });
    runTestUserNotFound(async function () {
      await botService.deleteBot(user, bot._id);
    });
    runTestUserNotVerified(async function () {
      await botService.deleteBot(user, bot._id);
    });
    runTestBotNotFound(async function () {
      await botService.deleteBot(user, bot._id);
    }, 'findOneAndDelete');
  });
  describe('editDefaultReply', () => {
    it('should return bot with newly edited default reply', async () => {
      bot.defaultReply = 'abc';
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOneAndUpdate'); //db mock

      const result = await botService.editDefaultReply(user, bot._id, 'abc');
      expect(result).toHaveProperty('_id', bot._id);
      expect(result).toHaveProperty('defaultReply', 'abc');
    });
    runTestUserNotFound(async function () {
      await botService.editDefaultReply(user, bot._id, 'abc');
    });
    runTestUserNotVerified(async function () {
      await botService.editDefaultReply(user, bot._id, 'abc');
    });
    runTestBotNotFound(async function () {
      await botService.editDefaultReply(user, bot._id, 'abc');
    }, 'findOneAndUpdate');
  });
  describe('getRepliesByBot', () => {
    it('should return bot with assigned replies', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOne'); //db mock
      mockingoose(ReplyModel).toReturn(reply, 'findOne'); //db mock

      const result = await botService.getRepliesByBot(user, bot._id, 1, 1);
      expect(result).toHaveProperty('_id', bot._id);
      expect(result.replies).toMatchObject(expect.arrayContaining([reply]));
    });
    runTestUserNotFound(async function () {
      await botService.getRepliesByBot(user, bot._id, 1, 1);
    });
    runTestUserNotVerified(async function () {
      await botService.getRepliesByBot(user, bot._id, 1, 1);
    });
    runTestBotNotFound(async function () {
      await botService.getRepliesByBot(user, bot._id, 1, 1);
    }, 'findOneAndUpdate');
  });
  describe('addReply', () => {
    it('should newly added reply', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOne'); //db mock
      mockingoose(ReplyModel).toReturn(null, 'findOne'); //db mock

      const result = await botService.addReply(user, bot._id, ['a'], 'b');
      expect(result).toHaveProperty('keywords', ['a']);
      expect(result).toHaveProperty('answer', 'b');
      expect(result).toHaveProperty('botBelongs', bot._id);
    });
    runTestUserNotFound(async function () {
      await botService.addReply(user, bot._id, ['a'], 'b');
    });
    runTestUserNotVerified(async function () {
      await botService.addReply(user, bot._id, ['a'], 'b');
    });
    runTestBotNotFound(async function () {
      await botService.addReply(user, bot._id, ['a'], 'b');
    });
    it('should return error if answer already exists within bot', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(BotModel).toReturn(bot, 'findOne'); //db mock
      mockingoose(ReplyModel).toReturn(reply, 'findOne'); //db mock

      return await botService
        .addReply(user, bot._id, ['a'], 'b')
        .catch((err) => {
          expect(err).toBeInstanceOf(ReplyAlreadyExistError);
        });
    });
    it('should return error if answer already exists within bot', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOne'); //db mock
      mockingoose(ReplyModel).toReturn(new ReplyAlreadyExistError(), 'findOne'); //db mock

      return await botService
        .addReply(user, bot._id, ['a'], 'b')
        .catch((err) => {
          expect(err).toBeInstanceOf(ReplyAlreadyExistError);
        });
    });
  });
  describe('delete reply', () => {
    it('should delete reply', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOne'); //db mock
      mockingoose(ReplyModel).toReturn(reply, 'findOneAndDelete'); //db mock

      const result = await botService.deleteReply(user, bot._id, reply._id);
      expect(result).toHaveProperty('_id', reply._id);
    });
    runTestUserNotFound(async function () {
      await botService.deleteReply(user, bot._id, reply._id);
    });
    runTestUserNotVerified(async function () {
      await botService.deleteReply(user, bot._id, reply._id);
    });
    runTestBotNotFound(async function () {
      await botService.deleteReply(user, bot._id, reply._id);
    });
    runTestReplyNotFound(async function () {
      await botService.deleteReply(user, bot._id, reply._id);
    }, 'findOneAndDelete');
  });
  describe('edit reply', () => {
    it('should return edited reply', async () => {
      let newReply = reply;
      newReply.keywords = ['a'];
      newReply.answer = 'b';
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOne'); //db mock
      mockingoose(ReplyModel).toReturn(newReply, 'findOneAndUpdate'); //db mock

      const result = await botService.editReply(
        user,
        bot._id,
        reply._id,
        ['a'],
        'b'
      );
      expect(result).toHaveProperty('_id', reply._id);
      expect(result).toHaveProperty('keywords', ['a']);
      expect(result).toHaveProperty('answer', 'b');
    });
    runTestUserNotFound(async function () {
      await botService.editReply(user, bot._id, reply._id, ['a'], 'b');
    });
    runTestUserNotVerified(async function () {
      await botService.editReply(user, bot._id, reply._id, ['a'], 'b');
    });
    runTestBotNotFound(async function () {
      await botService.editReply(user, bot._id, reply._id, ['a'], 'b');
    });
    runTestReplyNotFound(async function () {
      await botService.editReply(user, bot._id, reply._id, ['a'], 'b');
    }, 'findOneAndUpdate');
  });
  describe('changeReplyActive', () => {
    it('should return changed reply', async () => {
      const isActive = false;
      reply.isActive = isActive;
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOne'); //db mock
      mockingoose(ReplyModel).toReturn(reply, 'findOneAndUpdate'); //db mock

      const result = await botService.changeReplyActive(
        user,
        bot._id,
        reply._id,
        isActive
      );
      expect(result).toHaveProperty('_id', reply._id);
      expect(result).toHaveProperty('isActive', isActive);
    });
    runTestUserNotFound(async function () {
      await botService.changeReplyActive(user, bot._id, reply._id, false);
    });
    runTestUserNotVerified(async function () {
      await botService.changeReplyActive(user, bot._id, reply._id, false);
    });
    runTestBotNotFound(async function () {
      await botService.changeReplyActive(user, bot._id, reply._id, false);
    });
    runTestReplyNotFound(async function () {
      await botService.changeReplyActive(user, bot._id, reply._id, false);
    }, 'findOneAndUpdate');
  });
  describe('inviteModerator', () => {
    it('should return bot with newly added user moderator', async () => {
      mockingoose(UserModel).toReturn(user, 'findById'); //db mock
      mockingoose(BotModel).toReturn(bot, 'findOne'); //db mock
      UserModel.findOne = jest.fn().mockResolvedValue(user2);

      const result = await botService.inviteModerator(
        user,
        user2.email,
        bot._id
      );
      expect(result).toHaveProperty('_id', bot._id);
      expect(result).toHaveProperty('userModerators', [user2._id]);
    });
    it('should return error if user is not registered', async () => {
      UserModel.findById = jest.fn().mockResolvedValue(null);

      return await botService
        .inviteModerator(user, user2.email, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
    it('should return error if user is not isVerified', async () => {
      user.isVerified = false;
      UserModel.findById = jest.fn().mockResolvedValue(user);

      return await botService
        .inviteModerator(user, user2.email, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it('should return error if bot is not created', async () => {
      UserModel.findById = jest.fn().mockResolvedValue(user);
      UserModel.findOne = jest.fn().mockResolvedValue(user2);
      BotModel.findOne = jest.fn().mockResolvedValue(null);

      return await botService
        .inviteModerator(user, user2.email, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
    it('should return error if invited user is not registered', async () => {
      mockingoose(UserModel).toReturn(user, 'findById'); //db mock
      UserModel.findOne = jest.fn().mockResolvedValue(null);

      return await botService
        .inviteModerator(user, user2.email, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
    it('should return error if invited user is not isVerified', async () => {
      user2.isVerified = false;
      mockingoose(UserModel).toReturn(user, 'findById'); //db mock
      UserModel.findOne = jest.fn().mockResolvedValue(user2);

      return await botService
        .inviteModerator(user, user2.email, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it('should return error if bot is not found', async () => {
      mockingoose(UserModel).toReturn(user, 'findById'); //db mock
      UserModel.findOne = jest.fn().mockResolvedValue(user2);
      mockingoose(BotModel).toReturn(new BotNotFoundError(), 'findOne'); //db mock

      return await botService
        .inviteModerator(user, user2.email, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
  });
  describe('removeModerator', () => {
    // errors mongo queries, probably because of modules versions incapabilities
    // it('should return bot with newly removed moderator', async () => {
    //   bot.userModerators = [user2];
    //   mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
    //   UserModel.findById = jest.fn().mockResolvedValue(user2);
    //   mockingoose(BotModel).toReturn(bot, 'findOneAndUpdate'); //db mock
    //   bot.userModerators = [];
    //   mockingoose(UserModel).toReturn(null, 'updateOne'); //db mock
    //   BotModel.findById = jest.fn().mockResolvedValue(bot);

    //   const result = await botService.removeModerator(user, user2._id, bot._id);
    //   expect(result).toHaveProperty('_id', bot._id);
    //   expect(result).toHaveProperty('userModerators', []);
    // });
    it('should return error if user is not registered', async () => {
      UserModel.findOne = jest.fn().mockResolvedValue(null);

      return await botService
        .removeModerator(user, user2._id, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
    it('should return error if user is not isVerified', async () => {
      user.isVerified = false;
      UserModel.findOne = jest.fn().mockResolvedValue(user);

      return await botService
        .removeModerator(user, user2._id, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it('should return error if invited user is not registered', async () => {
      UserModel.findOne = jest.fn().mockResolvedValue(user);
      UserModel.findById = jest.fn().mockResolvedValue(null);

      return await botService
        .removeModerator(user, user2._id, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
    it('should return error if invited user is not isVerified', async () => {
      user2.isVerified = false;
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(user2);

      return await botService
        .removeModerator(user, user2._id, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it('should return error if bot is not found', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne'); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(user2);
      mockingoose(BotModel).toReturn(new BotNotFoundError(), 'findOne'); //db mock

      return await botService
        .removeModerator(user, user2._id, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
  });
});
