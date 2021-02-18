const UserModel = require("../models/user");
const ServiceError = require("../errors/serviceError");
const _ = require("lodash");

module.exports = class UserService {
  async signup(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (userRecord) throw new ServiceError("user already registered");

    userRecord = new UserModel(
      _.pick(user, ["firstName", "lastName", "email", "password", "isAdmin"])
    );
    userRecord.password = user.password;

    await userRecord.save();

    return _.pick(userRecord, [
      "_id",
      "firstName",
      "lastName",
      "email",
      "verified",
      "isAdmin",
    ]);
  }

  async login(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("invalid email or password");

    const validPassword = await userRecord.comparePassword(user.password);
    if (!validPassword) throw new ServiceError("invalid email or password");

    return _.pick(userRecord, [
      "_id",
      "firstName",
      "lastName",
      "email",
      "verified",
      "isAdmin",
    ]);
  }

  async edit(user, newFirstName, newLastName) {
    let userRecord = await UserModel.findOneAndUpdate(
      {
        email: user.email,
      },
      {
        firstName: newFirstName,
        lastName: newLastName,
      },
      { new: true }
    );
    if (!userRecord) throw new ServiceError("invalid email or password");

    return _.pick(userRecord, [
      "_id",
      "firstName",
      "lastName",
      "email",
      "verified",
      "isAdmin",
    ]);
  }

  async getMe(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

    return _.pick(userRecord, [
      "_id",
      "firstName",
      "lastName",
      "email",
      "verified",
      "isAdmin",
    ]);
  }

  async activateAccount(user, token) {
    const userRecord = await UserModel.findOne({
      email: user.email,
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });
    if (!userRecord) throw new ServiceError("Token is invalid or has expired");

    userRecord.resetToken = undefined;
    userRecord.resetExpires = undefined;
    userRecord.verified = true;

    await userRecord.save();

    return _.pick(userRecord, ["verified"]);
  }

  async resetPasswordByEmailtoken(token, password) {
    const userRecord = await UserModel.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });
    if (!userRecord) throw new ServiceError("Token is invalid or has expired");

    userRecord.password = password;
    userRecord.resetToken = undefined;
    userRecord.resetExpires = undefined;

    await userRecord.save();

    return;
  }

  async resetPasswordByPassword(user, oldPassword, newPassword) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("invalid email or password");

    const validPassword = await userRecord.comparePassword(oldPassword);
    if (!validPassword) throw new ServiceError("invalid email or password");

    userRecord.password = newPassword;

    await userRecord.save();

    return;
  }

  async changeEmailByToken(user, token) {
    const userRecord = await UserModel.findOne({
      email: user.email,
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });
    if (!userRecord) throw new ServiceError("Token is invalid or has expired");

    userRecord.email = userRecord.tempEmail;
    userRecord.tempEmail = undefined;
    userRecord.resetToken = undefined;
    userRecord.resetExpires = undefined;

    await userRecord.save();

    return userRecord;
  }
};
