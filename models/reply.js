const mongoose = require("mongoose");

const ReplyModel = mongoose.model(
  "Reply",
  new mongoose.Schema({
    botBelongs: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
    },
    keywords: {
      type: Array,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  })
);

module.exports = ReplyModel;
