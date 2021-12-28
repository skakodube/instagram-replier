const mongoose = require("mongoose");
const UserModel = require("../models/user");
const BotModel = require("../models/bot");
const ReplyModel = require("../models/reply");
const _ = require("lodash");
const UserNotFoundError = require("../errors/userNotFound");
const BotNotFoundError = require("../errors/botNotFound");
const BotAlreadyExistError = require("../errors/botAlreadyExist");
const ReplyAlreadyExistError = require("../errors/replyAlreadyExist");
const ReplyNotFoundError = require("../errors/replyNotFound");
const PermissionError = require("../errors/permissionError");

module.exports = class BotService {
  async getBots(user) {
    const userRecordAndBots = await UserModel.findOne({
      email: user.email,
    })
      .populate([
        {
          path: "OwnedBots",
          model: "Bot",
          select: "_id instagramUrl isActive profilePicture dateCreated",
        },
      ])
      .populate([
        {
          path: "InvitedBots",
          model: "Bot",
          InvitedBots: "_id instagramUrl isActive dateCreated",
        },
      ])
      .select("email firstName lastName isVerified isAdmin dateRegistered");
    if (!userRecordAndBots) throw new UserNotFoundError();
    if (!userRecordAndBots.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    return userRecordAndBots;
  }

  async createBot(user, { instagramUrl, credentials }) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    let botRecord = await BotModel.findOne({
      instagramUrl: instagramUrl,
    });
    if (botRecord) throw new BotAlreadyExistError("🔥 Bot URL Already Exist.");

    botRecord = new BotModel({
      userCreated: userRecord._id,
      instagramUrl,
      credentials,
    });

    userRecord.OwnedBots.push(botRecord._id);

    await userRecord.save();
    await botRecord.save();

    return _.pick(botRecord, [
      "_id",
      "instagramUrl",
      "isValid",
      "isActive",
      "replies",
      "defaultReply",
      "userCreated",
      "createdAt",
    ]);
  }

  async changeBotActive(user, botId, isActive) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOneAndUpdate(
      { _id: botId },
      { isActive },
      { new: true }
    );
    if (!botRecord) throw new BotNotFoundError();

    return _.pick(botRecord, [
      "_id",
      "instagramUrl",
      "isValid",
      "isActive",
      "replies",
      "defaultReply",
      "userCreated",
      "createdAt",
    ]);
  }

  async changeCredentials(user, botId, credentials) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOneAndUpdate(
      { _id: botId },
      { credentials },
      { new: true }
    );
    if (!botRecord) throw new BotNotFoundError();

    return _.pick(botRecord, [
      "_id",
      "instagramUrl",
      "isValid",
      "isActive",
      "replies",
      "defaultReply",
      "userCreated",
      "createdAt",
    ]);
  }

  async deleteBot(user, botToDeleteId) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOneAndDelete({
      _id: mongoose.Types.ObjectId(botToDeleteId),
      userCreated: userRecord._id,
    });
    if (!botRecord) throw new BotNotFoundError();

    await ReplyModel.deleteMany({ botBelongs: botRecord._id });

    return _.pick(botRecord, [
      "_id",
      "instagramUrl",
      "isValid",
      "isActive",
      "replies",
      "defaultReply",
      "userCreated",
      "createdAt",
    ]);
  }

  async getRepliesByBot(user, botId, pageNum, pageSize) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecordAndReplies = await BotModel.findById({
      _id: mongoose.Types.ObjectId(botId),
    })
      .populate([
        {
          path: "replies",
          model: "Reply",
          select: "_id keywords answer isActive",
          options: {
            skip: (pageNum - 1) * pageSize,
            limit: pageSize,
            sort: { created: -1 },
          },
        },
      ])
      .populate([
        {
          path: "userModerators",
          model: "User",
          select: "_id email firstName lastName",
        },
      ])

      .select(
        "_id userCreated instagramUrl isValid isActive defaultReply createdAt"
      );
    if (!botRecordAndReplies) throw new BotNotFoundError();
    //if no more, returs error

    return botRecordAndReplies;
  }

  async addReply(user, botId, newKeywords, newAnswer) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOne({
      _id: botId,
      userCreated: userRecord._id,
    });
    if (!botRecord) throw new BotNotFoundError();

    const replyRecord = await ReplyModel.findOne({
      botBelongs: botRecord._id,
      answer: newAnswer,
    });
    if (replyRecord)
      throw new ReplyAlreadyExistError(
        "🔥 Reply With This Answer Already Exist."
      );

    const newReply = new ReplyModel({
      botBelongs: botRecord._id,
      keywords: newKeywords,
      answer: newAnswer,
    });
    // {$addToSet: {users: userOid}} *uniqness* *not work*

    botRecord.replies.push(newReply._id);

    await botRecord.save();
    await newReply.save();

    return _.pick(newReply, [
      "_id",
      "answer",
      "keywords",
      "botBelongs",
      "isActive",
      "createdAt",
    ]);
  }

  async editReply(user, botId, replyId, keywords, newAnswer) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOne({
      _id: botId,
      userCreated: userRecord._id,
    });
    if (!botRecord) throw new BotNotFoundError();

    const editedReplyRecord = await ReplyModel.findOneAndUpdate(
      { _id: replyId, botBelongs: botRecord._id },
      {
        keywords: keywords,
        answer: newAnswer,
      },
      { new: true }
    );
    if (!editedReplyRecord) throw new ReplyNotFoundError();

    return _.pick(editedReplyRecord, [
      "_id",
      "answer",
      "keywords",
      "botBelogs",
      "isActive",
      "createdAt",
    ]);
  }

  async changeReplyActive(user, botId, replyId, isActive) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOne({ _id: botId });
    if (!botRecord) throw new BotNotFoundError();

    const replyRecord = await ReplyModel.findOneAndUpdate(
      { _id: replyId },
      {
        isActive,
      },
      { new: true }
    );
    if (!replyRecord) throw new ReplyNotFoundError();

    return _.pick(replyRecord, [
      "_id",
      "answer",
      "keywords",
      "botBelogs",
      "isActive",
      "createdAt",
    ]);
  }

  async deleteReply(user, botId, replyId) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOne({
      _id: mongoose.Types.ObjectId(botId),
      userCreated: userRecord._id,
    });
    if (!botRecord) throw new BotNotFoundError();

    const deletedReplyRecord = await ReplyModel.findOneAndDelete({
      _id: mongoose.Types.ObjectId(replyId),
      botBelongs: botRecord._id,
    });
    if (!deletedReplyRecord) throw new ReplyNotFoundError();

    return _.pick(deletedReplyRecord, [
      "_id",
      "answer",
      "keywords",
      "botBelogs",
      "isActive",
      "createdAt",
    ]);
  }

  async editDefaultReply(user, botId, defaultReply) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(botId),
        userCreated: userRecord._id,
      },
      {
        defaultReply,
      },
      { new: true }
    );
    if (!botRecord) throw new BotNotFoundError();

    return _.pick(botRecord, [
      "_id",
      "instagramUrl",
      "isValid",
      "isActive",
      "replies",
      "defaultReply",
      "userCreated",
      "createdAt",
    ]);
  }

  async inviteModerator(userOwner, userToInviteId, botId) {
    const userOwnerRecord = await UserModel.findOne({
      email: userOwner.email,
    });
    if (!userOwnerRecord) throw new UserNotFoundError();
    if (!userOwnerRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const userToInviteRecord = await UserModel.findById(userToInviteId);

    if (!userToInviteRecord) throw new UserNotFoundError();
    if (!userToInviteRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOne({
      _id: mongoose.Types.ObjectId(botId),
      userCreated: userOwnerRecord._id,
      userModerators: { $ne: userToInviteRecord._id },
    });
    if (!botRecord)
      throw new BotNotFoundError(
        "🔥 Bot Not Found Or User is Already Invited."
      );

    userToInviteRecord.InvitedBots.push(botRecord._id);
    botRecord.userModerators.push(userToInviteRecord._id);

    await userToInviteRecord.save();
    await botRecord.save();

    return _.pick(botRecord, [
      "_id",
      "instagramUrl",
      "isActive",
      "isValid",
      "replies",
      "defaultReply",
      "userCreated",
      "userModerators",
      "createdAt",
    ]);
  }

  async removeModerator(userOwner, userToRemoveId, botId) {
    const userOwnerRecord = await UserModel.findOne({
      email: userOwner.email,
    });
    if (!userOwnerRecord) throw new UserNotFoundError();
    if (!userOwnerRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const userToRemoveRecord = await UserModel.findById(userToRemoveId);
    if (!userToRemoveRecord) throw new UserNotFoundError();
    if (!userToRemoveRecord.isVerified)
      throw new PermissionError("🔥 User Is Not Verified.");

    const botRecord = await BotModel.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(botId),
        userCreated: userOwnerRecord._id,
        userModerators: { $eq: userToRemoveRecord._id },
      },
      {
        $pull: { userModerators: userToRemoveRecord._id },
      },
      { new: true }
    );

    if (!botRecord)
      throw new BotNotFoundError(
        "🔥 Bot Not Found or User is Already Invited."
      );

    await UserModel.updateOne(
      { _id: userToRemoveRecord._id },
      { $pull: { InvitedBots: botRecord._id } }
    );

    return _.pick(botRecord, [
      "_id",
      "instagramUrl",
      "isActive",
      "isValid",
      "replies",
      "defaultReply",
      "userCreated",
      "userModerators",
      "createdAt",
    ]);
  }
};
