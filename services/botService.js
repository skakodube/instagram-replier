const mongoose = require("mongoose");
const UserModel = require("../models/user");
const BotModel = require("../models/bot");
const ReplyModel = require("../models/reply");
const ServiceError = require("../errors/serviceError");
const _ = require("lodash");

module.exports = class UserService {
  async getBots(user) {
    const userRecordAndBots = await UserModel.findOne({
      email: user.email,
    })
      .populate([
        {
          path: "OwnedBots",
          model: "Bot",
          select: "_id instagramUrl active dateCreated",
        },
      ])
      .populate([
        {
          path: "bots",
          model: "Bot",
          InvitedBots: "_id instagramUrl active dateCreated",
        },
      ])
      .select("email firstName lastName verified isAdmin dateRegistered");
    if (!userRecordAndBots) throw new ServiceError("user doesn't exist");
    if (!userRecordAndBots.verified)
      throw new ServiceError("user is not verified");

    return userRecordAndBots;
  }

  async createBot(user, instagramUrl) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    let newBotRecord = await BotModel.findOne({
      instagramUrl: instagramUrl,
    });
    if (newBotRecord) throw new ServiceError("bot with his URL already exist");

    newBotRecord = new BotModel({
      userCreated: userRecord._id,
      instagramUrl: instagramUrl,
    });

    userRecord.OwnedBots.push(newBotRecord._id);

    await userRecord.save();
    await newBotRecord.save();

    return _.pick(newBotRecord, [
      "_id",
      "instagramUrl",
      "active",
      "replies",
      "userCreated",
      "createdAt",
    ]);
  }

  async deleteBot(user, botToDeleteId) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    let oldBotRecord = await BotModel.findOneAndDelete({
      _id: mongoose.Types.ObjectId(botToDeleteId),
      userCreated: userRecord._id,
    });
    if (!oldBotRecord) throw new ServiceError("invalid bot");

    await ReplyModel.deleteMany({ botBelongs: oldBotRecord._id });

    return _.pick(oldBotRecord, [
      "_id",
      "active",
      "instagramUrl",
      "replies",
      "userCreated",
      "updatedAt",
    ]);
  }

  async getRepliesByBot(user, botId) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    const botRecordAndReplies = await BotModel.findById({
      botId,
    })
      .populate([
        {
          path: "replies",
          model: "Reply",
          select: "_id keywords answer",
        },
      ])
      .populate([
        {
          path: "userModerators",
          model: "User",
          select: "_id email firstName lastName",
        },
      ])
      .select("userCreated instagramUrl active createdAt");
    if (!botRecordAndReplies) throw new ServiceError("bot doesn't exist");

    return botRecordAndReplies;
  }

  async addReply(user, botId, newKeywords, newAnswer) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    let botRecord = await BotModel.findOne({
      _id: botId,
      userCreated: userRecord._id,
    });
    if (!botRecord) throw new ServiceError("invalid bot");

    let newReply = new ReplyModel({
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
      "botBelogs",
      "createdAt",
    ]);
  }

  async deleteReply(user, botId, replyId) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    const botRecord = await BotModel.findOne({
      _id: mongoose.Types.ObjectId(botId),
      userCreated: userRecord._id,
    });
    if (!botRecord) throw new ServiceError("invalid bot");

    const deletedReplyRecord = await ReplyModel.findOneAndDelete({
      _id: mongoose.Types.ObjectId(replyId),
      botBelongs: botRecord._id,
    });
    if (!deletedReplyRecord) throw new ServiceError("invalid reply");

    return _.pick(deletedReplyRecord, [
      "_id",
      "answer",
      "keywords",
      "botBelogs",
      "createdAt",
    ]);
  }

  async editReply(user, botId, replyId, keywords, newAnswer) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    let botRecord = await BotModel.findOne({
      _id: botId,
      userCreated: userRecord._id,
    });
    if (!botRecord) throw new ServiceError("invalid bot");

    let editedReplyRecord = await ReplyModel.findByIdAndUpdate(
      replyId,
      {
        keywords: keywords,
        answer: newAnswer,
      },
      { new: true }
    );
    if (!editedReplyRecord) throw new ServiceError("invalid reply");

    return _.pick(editedReplyRecord, [
      "_id",
      "answer",
      "keywords",
      "botBelogs",
      "createdAt",
    ]);
  }

  async inviteModerator(userOwner, userToInviteId, botId) {
    const userOwnerRecord = await UserModel.findOne({
      email: userOwner.email,
    });
    if (!userOwnerRecord) throw new ServiceError("user doesn't exist");
    if (!userOwnerRecord.verified)
      throw new ServiceError("user is not verified");

    const userToInviteRecord = await UserModel.findById(userToInviteId);
    if (!userToInviteRecord) throw new ServiceError("user doesn't exist");
    if (!userToInviteRecord.verified)
      throw new ServiceError("user is not verified");

    const botRecord = await BotModel.findOne({
      _id: botId,
      userCreated: userOwnerRecord._id,
      userModerators: { $ne: userToInviteRecord._id },
    });
    if (!botRecord)
      throw new ServiceError("invalid bot or user is already invited");

    userToInviteRecord.InvitedBots.push(botRecord._id);
    botRecord.userModerators.push(userToInviteRecord._id);

    await userToInviteRecord.save();
    await botRecord.save();

    return _.pick(botRecord, [
      "_id",
      "instagramUrl",
      "active",
      "replies",
      "userCreated",
      "userModerators",
      "createdAt",
    ]);
  }

  async removeModerator(userOwner, userToRemoveId, botId) {
    const userOwnerRecord = await UserModel.findOne({
      email: userOwner.email,
    });
    if (!userOwnerRecord) throw new ServiceError("user doesn't exist");
    if (!userOwnerRecord.verified)
      throw new ServiceError("user is not verified");

    const userToRemoveRecord = await UserModel.findById(userToRemoveId);
    if (!userToRemoveRecord) throw new ServiceError("user doesn't exist");
    if (!userToRemoveRecord.verified)
      throw new ServiceError("user is not verified");

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

    await UserModel.updateOne(
      { _id: userToRemoveRecord._id },
      { $pull: { InvitedBots: botRecord._id } }
    );

    if (!botRecord)
      throw new ServiceError("invalid bot or user is already invited");

    return _.pick(botRecord, [
      "_id",
      "instagramUrl",
      "active",
      "replies",
      "userCreated",
      "userModerators",
      "createdAt",
    ]);
  }
};

// async getBotsAndReplies(user) {
//   //TODO:
//   //shorten return data
//   const userBotsReplies = await UserModel.findOne({
//     email: user.email,
//   })
//     .populate([
//       {
//         path: "bots",
//         model: "Bot",
//         select: "dateCreated instagramUrl",
//         populate: {
//           path: "replies",
//           model: "Reply",
//           select: "keywords answer",
//         },
//       },
//     ])
//     .select("email firstName lastName verified isAdmin dateRegistered");

//   if (!userBotsReplies) throw new ServiceError("user doesn't exist");

//   return userBotsReplies;
// }
