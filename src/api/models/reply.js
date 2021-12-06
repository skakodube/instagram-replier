const BotModel = require("./bot.js");
const mongoose = require("mongoose");

//TODO unique keywords?
const ReplySchema = new mongoose.Schema(
  {
    botBelongs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
    },
    keywords: {
      type: Array,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ReplySchema.pre("findOneAndDelete", async function (next) {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (!docToDelete) return;

  await BotModel.findOneAndUpdate(
    {
      replies: { $eq: docToDelete._id },
    },
    {
      $pull: { replies: docToDelete._id },
    }
  ).exec();
  next();
});

module.exports = mongoose.model("Reply", ReplySchema);
