const UserModel = require("../models/user");
const _ = require("lodash");
const UserAlreadyExistError = require("../errors/userAlreadyExist");
const UserNotFoundError = require("../errors/userNotFound");
const InvalidTokenError = require("../errors/invalidToken");

//TODO: check if user is verified
module.exports = class UserService {
  async signup(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (userRecord) throw new UserAlreadyExistError();

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
    if (!userRecord) throw new UserNotFoundError("Invalid Email Or Password.");

    const validPassword = await userRecord.comparePassword(user.password);
    if (!validPassword)
      throw new UserNotFoundError("Invalid Email Or Password.");

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
    if (!userRecord) throw new UserNotFoundError("Invalid Email Or Password.");

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
    if (!userRecord) throw new UserNotFoundError();

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
    if (!userRecord) throw new InvalidTokenError();

    userRecord.resetToken = undefined;
    userRecord.resetExpires = undefined;
    userRecord.verified = true;

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

  async resetPasswordByEmailtoken(token, password) {
    const userRecord = await UserModel.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() },
    });
    if (!userRecord) throw new InvalidTokenError();

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
    if (!userRecord) throw new UserNotFoundError("Invalid Email Or Password.");

    const validPassword = await userRecord.comparePassword(oldPassword);
    if (!validPassword)
      throw new UserNotFoundError("Invalid Email Or Password.");

    userRecord.password = newPassword;

    await userRecord.save();

    return;
  }

  async changeEmail(user, newEmail, password) {
    //could do in one method with OR operator
    if (user.email == newEmail)
      throw new UserNotFoundError("Invalid Email Or Password.");

    let userRecord = await UserModel.findOne({
      email: newEmail,
    });
    if (userRecord)
      throw new UserAlreadyExistError("User With This Email Already Exist.");

    userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError("Invalid Email Or Password.");

    const validPassword = await userRecord.comparePassword(password);
    if (!validPassword)
      throw new UserNotFoundError("Invalid Email Or Password.");

    const oldEmail = user.email;
    userRecord.email = newEmail;

    await userRecord.save();

    userRecord = _.pick(userRecord, [
      "_id",
      "firstName",
      "lastName",
      "email",
      "verified",
      "isAdmin",
    ]);

    return { userRecord, oldEmail };
  }

  // async changeEmailByToken(user, token) {
  //   const userRecord = await UserModel.findOne({
  //     email: user.email,
  //     resetToken: token,
  //     resetExpires: { $gt: Date.now() },
  //   });
  //   if (!userRecord) throw new ApplicationError("Token is invalid or has expired");

  //   userRecord.email = userRecord.tempEmail;
  //   userRecord.tempEmail = undefined;
  //   userRecord.resetToken = undefined;
  //   userRecord.resetExpires = undefined;

  //   await userRecord.save();

  //   return userRecord;
  // }
};
