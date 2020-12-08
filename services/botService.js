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
      instagramUrl: instagramUrl,
    });
    if (!botRecord) throw new ServiceError("invalid bot");

    return botRecord;
  }
};
