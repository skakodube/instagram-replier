const mongoose = require("mongoose");

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
    verified: Boolean,
    isAdmin: Boolean,
    dateRegistered: {
      type: Date,
      default: Date.now,
    },
  })
);

module.exports = UserModel;
