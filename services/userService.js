const UserModel = require("../models/user");
const ServiceError = require("../errors/serviceError");
const _ = require("lodash");
const bcrypt = require("bcrypt");

module.exports = class UserService {
  async signup(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (userRecord) throw new ServiceError("user already registered");

    userRecord = new UserModel(
      _.pick(user, ["name", "email", "password", "isAdmin"])
    );
    const salt = await bcrypt.genSalt(10);
    userRecord.password = await bcrypt.hash(userRecord.password, salt);

    await userRecord.save();

    return userRecord;
  }

  async login(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("invalid email or password");

    const validPassword = await bcrypt.compare(
      user.password,
      userRecord.password
    );
    if (!validPassword) throw new ServiceError("invalid email or password");

    return userRecord;
  }

  async getMe(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

    return _.pick(userRecord, ["name", "email"]);
  }

  async verify(user) {
    //after verified by email
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

    userRecord.verified = true;

    await userRecord.save();

    return userRecord.verified;
  }
};
