const UserModel = require('../models/user');
const _ = require('lodash');
const mongoose = require('mongoose');
const UserAlreadyExistError = require('../errors/userAlreadyExist');
const UserNotFoundError = require('../errors/userNotFound');
const InvalidTokenError = require('../errors/invalidToken');

module.exports = class UserService {
  async login(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord)
      throw new UserNotFoundError('🔥 Invalid Email Or Password.');

    const isValidPassword = await userRecord.comparePassword(user.password);
    if (!isValidPassword)
      throw new UserNotFoundError('🔥 Invalid Email Or Password.');

    return _.pick(userRecord, [
      '_id',
      'firstName',
      'lastName',
      'email',
      'isVerified',
    ]);
  }

  async signup(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (userRecord) throw new UserAlreadyExistError();

    userRecord = new UserModel(
      _.pick(user, ['firstName', 'lastName', 'email', 'password'])
    );
    userRecord.password = user.password;

    await userRecord.save();

    return _.pick(userRecord, [
      '_id',
      'firstName',
      'lastName',
      'email',
      'isVerified',
    ]);
  }

  async getMe(user) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    userRecord = _.set(
      userRecord,
      'OwnedBotsQuantity',
      userRecord.OwnedBots.length
    );
    userRecord = _.set(
      userRecord,
      'InvitedBotsQuantity',
      userRecord.InvitedBots.length
    );
    return (userRecord = _.pick(userRecord, [
      '_id',
      'firstName',
      'lastName',
      'email',
      'isVerified',
      'OwnedBotsQuantity',
      'InvitedBotsQuantity',
    ]));
  }

  async getUsername(id) {
    let userRecord = await UserModel.findById(mongoose.Types.ObjectId(id));
    if (!userRecord) throw new UserNotFoundError();

    return (userRecord = _.pick(userRecord, [
      '_id',
      'firstName',
      'lastName',
      'email',
    ]));
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
    if (!userRecord)
      throw new UserNotFoundError('🔥 Invalid Email Or Password.');

    return _.pick(userRecord, [
      '_id',
      'firstName',
      'lastName',
      'email',
      'isVerified',
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
    userRecord.isVerified = true;

    await userRecord.save();

    return _.pick(userRecord, [
      '_id',
      'firstName',
      'lastName',
      'email',
      'isVerified',
    ]);
  }

  async resetPasswordByPassword(user, oldPassword, newPassword) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord)
      throw new UserNotFoundError('🔥 Invalid Email Or Password.');

    const isValidPassword = await userRecord.comparePassword(oldPassword);
    if (!isValidPassword)
      throw new UserNotFoundError('🔥 Invalid Email Or Password.');

    userRecord.password = newPassword;

    await userRecord.save();

    return;
  }

  async changeEmail(user, newEmail, password) {
    //could do in one method with OR operator
    if (user.email == newEmail)
      throw new UserNotFoundError('🔥 Invalid Email Or Password.');

    let userRecord = await UserModel.findOne({
      email: newEmail,
    });
    if (userRecord)
      throw new UserAlreadyExistError('🔥 User With This Email Already Exist.');

    userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord)
      throw new UserNotFoundError('🔥 Invalid Email Or Password.');

    const isValidPassword = await userRecord.comparePassword(password);
    if (!isValidPassword)
      throw new UserNotFoundError('🔥 Invalid Email Or Password.');

    const oldEmail = user.email;
    userRecord.email = newEmail;

    await userRecord.save();

    user = _.pick(userRecord, [
      '_id',
      'firstName',
      'lastName',
      'email',
      'isVerified',
    ]);

    return { user, oldEmail };
  }

  async recoverPasswordByEmailtoken(token, password) {
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
