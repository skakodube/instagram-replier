const mongoose = require("mongoose");
const UserModel = require("./user");

//TODO:
//add active

const BotSchema = new mongoose.Schema(
  {
    userCreated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instagramUrl: String,
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
    userModerators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

BotSchema.pre("findOneAndDelete", async function (next) {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (!docToDelete) return;
  // await ReplyModel.deleteMany({ botBelongs: docToDelete._id }).exec(); *circular depedency error*
  await UserModel.findOneAndUpdate(
    {
      OwnedBots: { $eq: docToDelete._id },
    },
    {
      $pull: { OwnedBots: docToDelete._id },
    }
  ).exec();
  await UserModel.updateMany(
    {
      InvitedBots: { $eq: docToDelete._id },
    },
    {
      $pull: { InvitedBots: docToDelete._id },
    },
    { multi: true }
  ).exec();
  next();
});

module.exports = mongoose.model("Bot", BotSchema);
