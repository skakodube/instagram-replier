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
    userRecord.password = await userRecord.password;

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

  async activateAccount(user) {
    //after verified by email
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

    userRecord.verified = true;

    await userRecord.save();

    return _.pick(userRecord, ["verified"]);
  }

  async resetPassword(email, newPassword) {
    let userRecord = await UserModel.findOne({
      email: email,
    });
    if (!userRecord) throw new ServiceError("invalid email or password");

    userRecord.password = await newPassword;

    await userRecord.save();

    return userRecord;
  }
};
