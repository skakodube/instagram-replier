const mongoose = require("mongoose");
const UserModel = require("./user");
//
const BotSchema = new mongoose.Schema(
  {
    userCreated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instagramUrl: String,
    active: {
      type: Boolean,
      default: false,
    },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
    userModerators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

BotSchema.pre("findOneAndDelete", async function (next) {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (!docToDelete) return;
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
  // await ReplyModel.deleteMany({ botBelongs: docToDelete._id }).exec(); *circular depedency error*
});

module.exports = mongoose.model("Bot", BotSchema);
