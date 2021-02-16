const UserModel = require("../models/user");
const BotModel = require("../models/bot");
const ReplyModel = require("../models/reply");
const ServiceError = require("../errors/serviceError");
const _ = require("lodash");

module.exports = class UserService {
  async getBots(user) {
    const userBotsReplies = await UserModel.findOne({
      email: user.email,
    })
      .populate([
        {
          path: "bots",
          model: "Bot",
          select: "dateCreated instagramUrl",
          populate: {
            path: "replies",
            model: "Reply",
            select: "keywords text",
          },
        },
      ])
      .select("email name verified isAdmin dateRegistered");

    if (!userBotsReplies) throw new ServiceError("user doesn't exist");

    return userBotsReplies;
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

    userRecord.bots.push(newBotRecord._id);

    await userRecord.save();
    await newBotRecord.save();

    return newBotRecord;
  }

  async deleteBot(user, instagramUrl) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    let botRecord = await BotModel.findOneAndDelete({
      userCreated: userRecord._id,
      instagramUrl: instagramUrl,
    });
    if (!botRecord) throw new ServiceError("invalid bot");

    return botRecord;
  }

  async addReply(user, instagramUrl, keywords, replyText) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    let botRecord = await BotModel.findOne({
      userCreated: userRecord._id,
      instagramUrl: instagramUrl,
    });
    if (!botRecord) throw new ServiceError("invalid bot");

    let newReply = new ReplyModel({
      botBelongs: botRecord._id,
      keywords: keywords,
      text: replyText,
    });

    botRecord.replies.push(newReply._id);

    await botRecord.save();
    await newReply.save();

    return newReply;
  }

  async deleteReply(user, instagramUrl, replyId) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    let botRecord = await BotModel.findOneAndUpdate(
      {
        userCreated: userRecord._id,
        instagramUrl: instagramUrl,
      },
      { $pull: { replies: replyId } }
    );
    if (!botRecord) throw new ServiceError("invalid bot");

    let replyRecord = await ReplyModel.findByIdAndDelete(replyId);
    if (!replyRecord) throw new ServiceError("invalid reply");

    await botRecord.save();
    return replyRecord;
  }

  async modifyReply(user, instagramUrl, replyId, keywords, replyText) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");
    if (!userRecord.verified) throw new ServiceError("user is not verified");

    let botRecord = await BotModel.findOne({
      userCreated: userRecord._id,
      instagramUrl: instagramUrl,
    });
    if (!botRecord) throw new ServiceError("invalid bot");

    let replyRecord = await ReplyModel.findByIdAndUpdate(
      replyId,
      {
        keywords: keywords,
        text: replyText,
      },
      { new: true }
    );
    if (!replyRecord) throw new ServiceError("invalid reply");

    return replyRecord;
  }
};
