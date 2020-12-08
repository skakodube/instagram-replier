const UserModel = require("../models/user");
const BotModel = require("../models/bot");
const ReplyModel = require("../models/reply");
const ServiceError = require("../errors/serviceError");
const _ = require("lodash");

module.exports = class UserService {
  async createBot(user, instagramUrl) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

    let newBotRecord = await BotModel.findOne({
      instagramUrl: instagramUrl,
    });
    if (newBotRecord) throw new ServiceError("bot with his URL already exist");

    newBotRecord = new BotModel({
      userCreated: userRecord._id,
      instagramUrl: instagramUrl,
    });

    await newBotRecord.save();

    let newDefaultReply = new ReplyModel({
      botBelongs: newBotRecord._id,
      keywords: ["Hello"],
      text: "Welcome to my instagram profile!",
    });

    await newDefaultReply.save();

    newBotRecord = JSON.parse(JSON.stringify(newBotRecord));
    newBotRecord.reply = newDefaultReply;

    return newBotRecord;
  }

  async deleteBot(user, instagramUrl) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

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

    await newReply.save();

    return botRecord;
  }

  async deleteReply(user, instagramUrl, replyId) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

    let botRecord = await BotModel.findOne({
      userCreated: userRecord._id,
      instagramUrl: instagramUrl,
    });
    if (!botRecord) throw new ServiceError("invalid bot");

    let replyRecord = await ReplyModel.findByIdAndDelete(replyId);
    if (!replyRecord) throw new ServiceError("invalid reply");

    return replyRecord;
  }

  async modifyReply(user, instagramUrl, replyId, keywords, replyText) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

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
