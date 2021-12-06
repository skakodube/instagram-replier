/**
 * Tests Bot service
 *
 * @group unit/services/bot
 */

const mongoose = require("mongoose");
const mockingoose = require("mockingoose");
const UserModel = require("../../../src/api/models/user");
const BotModel = require("../../../src/api/models/bot");
const ReplyModel = require("../../../src/api/models/reply");
const UserNotFoundError = require("../../../src/api/errors/userNotFound");
const BotNotFoundError = require("../../../src/api/errors/botNotFound");
const BotAlreadyExistError = require("../../../src/api/errors/botAlreadyExist");
const ReplyAlreadyExistError = require("../../../src/api/errors/replyAlreadyExist");
const ReplyNotFoundError = require("../../../src/api/errors/replyNotFound");
const PermissionError = require("../../../src/api/errors/permissionError");
const BotService = require("../../../src/api/services/botService");

describe("botService", () => {
  const botService = new BotService();
  let user, bot, reply, user2;
  beforeEach(() => {
    user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "email@email.com",
      firstName: "Mark",
      lastName: "Watney",
      password: "12345",
      isVerified: true,
    });
    bot = new BotModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      instagramUrl: "url",
      credentials: {
        username: "abc",
        password: "abc",
      },
      userCreated: user._id,
    });
    reply = new ReplyModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      botBelongs: bot._id,
      keywords: ["k1", "k2"],
      answer: "answer",
    });
    bot.replies = [reply];
    user2 = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "email2@email.com",
      firstName: "Anna",
      lastName: "Stone",
      password: "12345",
      isVerified: true,
    });
  });
  afterEach(() => {
    mockingoose(UserModel).reset();
    mockingoose(BotModel).reset();
    mockingoose(ReplyModel).reset();
    UserModel.findById = null;
  });
  describe("getBots", () => {
    it("should return user and bots assigned", async () => {
      user.OwnedBots = [bot];
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      const result = await botService.getBots(user);
      expect(result).toMatchObject(user);
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(new UserNotFoundError(), "findOne"); //db mock

      return await botService.getBots(user).catch((err) => {
        expect(err).toBeInstanceOf(UserNotFoundError);
      });
    });
    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService.getBots(user).catch((err) => {
        expect(err).toBeInstanceOf(PermissionError);
      });
    });
  });
  describe("createBot", () => {
    it("should return created bot", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(null, "findOne"); //db mock
      const instagramUrl = "url";
      const credentials = { username: "abc", password: "abc" };

      const result = await botService.createBot(user, {
        instagramUrl,
        credentials,
      });
      expect(result).toHaveProperty("instagramUrl", "url");
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(new UserNotFoundError(), "findOne");

      return await botService.createBot(user, "url").catch((err) => {
        expect(err).toBeInstanceOf(UserNotFoundError);
      });
    });
    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;

      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService.createBot(user, "url").catch((err) => {
        expect(err).toBeInstanceOf(PermissionError);
      });
    });
    it("should return error if url is used by other bot", async () => {
      mockingoose(UserModel).toReturn(user, "findOne");
      mockingoose(BotModel).toReturn(new BotAlreadyExistError(), "findOne"); //db mock

      return await botService.createBot(user, "url").catch((err) => {
        expect(err).toBeInstanceOf(BotAlreadyExistError);
      });
    });
  });

  describe("changeBotActive", () => {
    it("should return changed bot", async () => {
      const isActive = true;
      bot.isActive = isActive;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOneAndUpdate"); //db mock

      const result = await botService.changeBotActive(user, bot._id, isActive);
      expect(result).toHaveProperty("isActive", isActive);
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock

      return await botService
        .changeBotActive(user, bot._id, true)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });

    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService
        .changeBotActive(user, bot._id, true)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if bot is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(
        new BotNotFoundError(),
        "findOneAndDelete"
      ); //db mock

      return await botService
        .changeBotActive(user, bot._id, true)
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
  });

  describe("deleteBot", () => {
    it("should delete bot and it's replies", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOneAndDelete"); //db mock
      mockingoose(ReplyModel).toReturn(reply, "deleteMany"); //db mock

      const result = await botService.deleteBot(user, bot._id);
      expect(result).toHaveProperty("_id", bot._id);
    });

    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock

      return await botService.deleteBot(user, bot._id).catch((err) => {
        expect(err).toBeInstanceOf(UserNotFoundError);
      });
    });

    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService.deleteBot(user, bot._id).catch((err) => {
        expect(err).toBeInstanceOf(PermissionError);
      });
    });
    it("should return error if bot is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(
        new BotNotFoundError(),
        "findOneAndDelete"
      ); //db mock

      return await botService.deleteBot(user, bot._id).catch((err) => {
        expect(err).toBeInstanceOf(BotNotFoundError);
      });
    });
  });

  describe("editDefaultReply", () => {
    it("should return bot with newly edited default reply", async () => {
      bot.defaultReply = "abc";
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOneAndUpdate"); //db mock

      const result = await botService.editDefaultReply(user, bot._id, "abc");
      expect(result).toHaveProperty("_id", bot._id);
      expect(result).toHaveProperty("defaultReply", "abc");
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock

      return await botService
        .editDefaultReply(user, bot._id, "abc")
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });

    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService
        .editDefaultReply(user, bot._id, "abc")
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if bot is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(
        new BotNotFoundError(),
        "findOneAndDelete"
      ); //db mock

      return await botService
        .editDefaultReply(user, bot._id, "abc")
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
  });

  describe("addReply", () => {
    it("should newly added reply", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOne"); //db mock
      mockingoose(ReplyModel).toReturn(null, "findOne"); //db mock

      const result = await botService.addReply(user, bot._id, ["a"], "b");
      expect(result).toHaveProperty("keywords", ["a"]);
      expect(result).toHaveProperty("answer", "b");
      expect(result).toHaveProperty("botBelongs", bot._id);
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock

      return await botService
        .addReply(user, bot._id, ["a"], "b")
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });

    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService
        .addReply(user, bot._id, ["a"], "b")
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if bot is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(new BotNotFoundError(), "findOne"); //db mock

      return await botService
        .addReply(user, bot._id, ["a"], "b")
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
    it("should return error if answer already exists within bot", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOne"); //db mock
      mockingoose(ReplyModel).toReturn(new ReplyAlreadyExistError(), "findOne"); //db mock

      return await botService
        .addReply(user, bot._id, ["a"], "b")
        .catch((err) => {
          expect(err).toBeInstanceOf(ReplyAlreadyExistError);
        });
    });
  });
  describe("delete reply", () => {
    it("should delete reply", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOne"); //db mock
      mockingoose(ReplyModel).toReturn(reply, "findOneAndDelete"); //db mock

      const result = await botService.deleteReply(user, bot._id, reply._id);
      expect(result).toHaveProperty("_id", reply._id);
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock

      return await botService
        .deleteReply(user, bot._id, reply._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });

    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService
        .deleteReply(user, bot._id, reply._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if bot is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(new BotNotFoundError(), "findOne"); //db mock

      return await botService
        .deleteReply(user, bot._id, reply._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
    it("should return error if reply is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOne"); //db mock
      mockingoose(ReplyModel).toReturn(
        new ReplyNotFoundError(),
        "findOneAndDelete"
      ); //db mock

      return await botService
        .deleteReply(user, bot._id, reply._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(ReplyNotFoundError);
        });
    });
  });
  describe("edit reply", () => {
    it("should return edited reply", async () => {
      let newReply = reply;
      newReply.keywords = ["a"];
      newReply.answer = "b";
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOne"); //db mock
      mockingoose(ReplyModel).toReturn(newReply, "findOneAndUpdate"); //db mock

      const result = await botService.editReply(
        user,
        bot._id,
        reply._id,
        ["a"],
        "b"
      );
      expect(result).toHaveProperty("_id", reply._id);
      expect(result).toHaveProperty("keywords", ["a"]);
      expect(result).toHaveProperty("answer", "b");
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock

      return await botService
        .editReply(user, bot._id, reply._id, ["a"], "b")
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });

    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService
        .editReply(user, bot._id, reply._id, ["a"], "b")
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if bot is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(new BotNotFoundError(), "findOne"); //db mock

      return await botService
        .editReply(user, bot._id, reply._id, ["a"], "b")
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
    it("should return error if reply is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOne"); //db mock
      mockingoose(ReplyModel).toReturn(
        new ReplyNotFoundError(),
        "findOneAndDelete"
      ); //db mock

      return await botService
        .editReply(user, bot._id, reply._id, ["a"], "b")
        .catch((err) => {
          expect(err).toBeInstanceOf(ReplyNotFoundError);
        });
    });
  });

  describe("changeReplyActive", () => {
    it("should return changed reply", async () => {
      const isActive = false;
      reply.isActive = isActive;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOne"); //db mock
      mockingoose(ReplyModel).toReturn(reply, "findOneAndUpdate"); //db mock

      const result = await botService.changeReplyActive(
        user,
        bot._id,
        reply._id,
        isActive
      );
      expect(result).toHaveProperty("_id", reply._id);
      expect(result).toHaveProperty("isActive", isActive);
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock

      return await botService
        .changeReplyActive(user, bot._id, reply._id, false)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });

    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService
        .changeReplyActive(user, bot._id, reply._id, false)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if bot is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(new BotNotFoundError(), "findOne"); //db mock

      return await botService
        .changeReplyActive(user, bot._id, reply._id, false)
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
    it("should return error if reply is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOne"); //db mock
      mockingoose(ReplyModel).toReturn(
        new ReplyNotFoundError(),
        "findOneAndUpdate"
      ); //db mock

      return await botService
        .changeReplyActive(user, bot._id, reply._id, false)
        .catch((err) => {
          expect(err).toBeInstanceOf(ReplyNotFoundError);
        });
    });
  });

  describe("inviteModerator", () => {
    it("should return bot with newly user moderator", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOne"); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(user2);

      const result = await botService.inviteModerator(user, user2, bot._id);
      expect(result).toHaveProperty("_id", bot._id);
      expect(result).toHaveProperty("userModerators", [user2._id]);
    });

    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock

      return await botService
        .inviteModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService
        .inviteModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if invited user is not registered", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(null);

      return await botService
        .inviteModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
    it("should return error if invited user is not isVerified", async () => {
      user2.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(user2);

      return await botService
        .inviteModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if bot is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(user2);
      mockingoose(BotModel).toReturn(new BotNotFoundError(), "findOne"); //db mock

      return await botService
        .inviteModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
  });
  describe("removeModerator", () => {
    it("should return bot with newly removed moderator", async () => {
      bot.userModerators = [user2];
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      mockingoose(BotModel).toReturn(bot, "findOneAndUpdate"); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(user2);
      bot.userModerators = [];
      mockingoose(UserModel).toReturn(null, "updateOne"); //db mock

      const result = await botService.removeModerator(user, user2, bot._id);
      expect(result).toHaveProperty("_id", bot._id);
      expect(result).toHaveProperty("userModerators", []);
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock

      return await botService
        .removeModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
    it("should return error if user is not isVerified", async () => {
      user.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await botService
        .removeModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if invited user is not registered", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(null);

      return await botService
        .removeModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
    it("should return error if invited user is not isVerified", async () => {
      user2.isVerified = false;
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(user2);

      return await botService
        .removeModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(PermissionError);
        });
    });
    it("should return error if bot is not found", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock
      UserModel.findById = jest.fn().mockResolvedValue(user2);
      mockingoose(BotModel).toReturn(new BotNotFoundError(), "findOne"); //db mock

      return await botService
        .removeModerator(user, user2, bot._id)
        .catch((err) => {
          expect(err).toBeInstanceOf(BotNotFoundError);
        });
    });
  });
});
