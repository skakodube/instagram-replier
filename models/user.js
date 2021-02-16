const mongoose = require("mongoose");
//TODO separate first and surname
const UserModel = mongoose.model(
  "User",
  new mongoose.Schema({
    name: {
      type: String,
      require: true,
      minlength: 5,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isAdmin: Boolean,
    dateRegistered: {
      type: Date,
      default: Date.now,
    },
    bots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bot" }],
  })
);

module.exports = UserModel;
