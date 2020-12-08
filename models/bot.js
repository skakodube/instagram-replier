const mongoose = require("mongoose");
const ReplyModel = require("./reply");

const botSchema = new mongoose.Schema({
  userCreated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dateCreated: {
    type: Date,
    required: true,
    default: Date.now,
  },
  instagramUrl: String,
}).pre("findOneAndDelete", async function (next) {
  //CASCADE DELETION OF REPLIES
  const docToDelete = await this.model.findOne(this.getQuery());
  await ReplyModel.deleteMany({ botBelongs: docToDelete._id }).exec();
  next();
});

const BotModel = mongoose.model("Bot", botSchema);

module.exports = BotModel;
