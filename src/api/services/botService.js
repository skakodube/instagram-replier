const mongoose = require('mongoose');
const UserModel = require('../models/user');
const BotModel = require('../models/bot');
const ReplyModel = require('../models/reply');
const _ = require('lodash');
const UserNotFoundError = require('../errors/userNotFound');
const UserAlreadyExistError = require('../errors/userAlreadyExist');
const BotNotFoundError = require('../errors/botNotFound');
const BotAlreadyExistError = require('../errors/botAlreadyExist');
const ReplyAlreadyExistError = require('../errors/replyAlreadyExist');
const ReplyNotFoundError = require('../errors/replyNotFound');
const PermissionError = require('../errors/permissionError');

module.exports = class BotService {
  async getBots(user) {
    const userRecordAndBots = await UserModel.findOne({
      email: user.email,
    })
      .populate([
        {
          path: 'OwnedBots',
          model: 'Bot',
          populate: {
            path: 'userCreated',
            model: 'User',
            select: '_id email firstName lastName',
          },
          populate: {
            path: 'userModerators',
            model: 'User',
            select: '_id email firstName lastName',
          },
          select:
            '_id credentials.username defaultReply isActive isValid dateCreated',
        },
      ])
      .populate([
        {
          path: 'InvitedBots',
          model: 'Bot',
          populate: {
            path: 'userModerators',
            model: 'User',
            select: ' _id email firstName lastName',
          },
        },
      ])
      .populate([
        {
          path: 'InvitedBots',
          model: 'Bot',
          populate: {
            path: 'userCreated',
            model: 'User',
            select: '_id email firstName lastName',
          },
          select:
            '_id credentials.username defaultReply isActive isValid dateCreated',
        },
      ])
      .select('email firstName lastName isVerified dateRegistered');

    if (!userRecordAndBots) throw new UserNotFoundError();
    if (!userRecordAndBots.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    return userRecordAndBots;
  }

  async createBot(user, credentials) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    let botRecord = await BotModel.findOne({
      'credentials.username': credentials.username,
    });
    if (botRecord) {
      throw new BotAlreadyExistError('🔥 Bot Username Already Exist.');
    }
    botRecord = new BotModel({
      userCreated: userRecord._id,
      credentials,
    });

    userRecord.OwnedBots.push(botRecord._id);

    await userRecord.save();
    await botRecord.save();

    return _.pick(botRecord, [
      '_id',
      'credentials.username',
      'isValid',
      'isActive',
      'defaultReply',
      'userCreated',
      'createdAt',
    ]);
  }

  async changeBotActive(user, botId, isActive) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const botRecord = await BotModel.findOneAndUpdate(
      {
        _id: botId,
        $or: [
          { userCreated: userRecord._id },
          { userModerators: userRecord._id },
        ],
      },
      { isActive },
      { new: true }
    );
    if (!botRecord) throw new BotNotFoundError();

    return _.pick(botRecord, [
      '_id',
      'credentials.username',
      'isValid',
      'isActive',
      'replies',
      'defaultReply',
      'userCreated',
      'createdAt',
    ]);
  }

  async changeCredentials(user, botId, credentials) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const botRecord = await BotModel.findOneAndUpdate(
      { _id: botId },
      { credentials },
      { new: true }
    );
    if (!botRecord) throw new BotNotFoundError();

    return _.pick(botRecord, [
      '_id',
      'credentials.username',
      'isValid',
      'isActive',
      'replies',
      'defaultReply',
      'userCreated',
      'createdAt',
    ]);
  }

  async deleteBot(user, botToDeleteId) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const botRecord = await BotModel.findOneAndDelete({
      _id: mongoose.Types.ObjectId(botToDeleteId),
      userCreated: userRecord._id,
    });
    if (!botRecord) throw new BotNotFoundError();

    await ReplyModel.deleteMany({ botBelongs: botRecord._id });

    return _.pick(botRecord, [
      '_id',
      'credentials.username',
      'isValid',
      'isActive',
      'replies',
      'defaultReply',
      'userCreated',
      'createdAt',
    ]);
  }

  //=========================Replies=========================//

  async getRepliesByBot(user, botId, pageNum, pageSize) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const botRecordAndReplies = await BotModel.findById({
      _id: mongoose.Types.ObjectId(botId),
    })
      .populate([
        {
          path: 'replies',
          model: 'Reply',
          select: '_id keywords answer isActive',
          options: {
            skip: (pageNum - 1) * pageSize,
            limit: pageSize,
            sort: { created: -1 },
          },
        },
      ])
      .populate([
        {
          path: 'userModerators',
          model: 'User',
          select: '_id email firstName lastName',
        },
      ])

      .select(
        '_id credentials.username isValid isActive defaultReply userCreated createdAt'
      );
    if (!botRecordAndReplies) throw new BotNotFoundError();

    return botRecordAndReplies;
  }

  async addReply(user, botId, newKeywords, newAnswer) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const botRecord = await BotModel.findOne({
      _id: botId,
      $or: [
        { userCreated: userRecord._id },
        { userModerators: userRecord._id },
      ],
    });
    if (!botRecord) throw new BotNotFoundError();

    const replyRecord = await ReplyModel.findOne({
      botBelongs: botRecord._id,
      // }).or({ answer: newAnswer }, { keywords: { $in: [newKeywords] } });
      $or: [{ answer: newAnswer }, { keywords: { $in: [newKeywords] } }],
    });
    if (replyRecord)
      throw new ReplyAlreadyExistError(
        '🔥 Reply With This Answer Or Keywords Already Exist.'
      );

    const newReply = new ReplyModel({
      botBelongs: botRecord._id,
      keywords: newKeywords,
      answer: newAnswer,
    });
    // unique shortcut *not work*
    // {$addToSet: {users: userOid}}

    botRecord.replies.push(newReply._id);

    await botRecord.save();
    await newReply.save();

    return _.pick(newReply, [
      '_id',
      'answer',
      'keywords',
      'botBelongs',
      'isActive',
      'createdAt',
    ]);
  }

  async editReply(user, botId, replyId, newKeywords, newAnswer) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const botRecord = await BotModel.findOne({
      _id: botId,
      $or: [
        { userCreated: userRecord._id },
        { userModerators: userRecord._id },
      ],
    });
    if (!botRecord) throw new BotNotFoundError();

    const editedReplyRecord = await ReplyModel.findOneAndUpdate(
      {
        _id: replyId,
        botBelongs: botRecord._id,
        $and: [
          { answer: { $ne: newAnswer } },
          { keywords: { $nin: [newKeywords] } },
        ],
      },
      {
        keywords: newKeywords,
        answer: newAnswer,
      },
      { new: true }
    );
    // ).or({ answer: newAnswer }, { keywords: { $in: [newKeywords] } });
    if (!editedReplyRecord)
      throw new ReplyNotFoundError(
        '🔥 No Reply found Or Keywords/Answer Already Used.'
      );

    return _.pick(editedReplyRecord, [
      '_id',
      'answer',
      'keywords',
      'botBelogs',
      'isActive',
      'createdAt',
    ]);
  }

  async changeReplyActive(user, botId, replyId, isActive) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const botRecord = await BotModel.findOne({
      _id: botId,
      $or: [
        { userCreated: userRecord._id },
        { userModerators: userRecord._id },
      ],
    });
    if (!botRecord) throw new BotNotFoundError();

    const replyRecord = await ReplyModel.findOneAndUpdate(
      { _id: replyId },
      {
        isActive,
      },
      { new: true }
    );
    if (!replyRecord) throw new ReplyNotFoundError();

    return _.pick(replyRecord, [
      '_id',
      'answer',
      'keywords',
      'botBelogs',
      'isActive',
      'createdAt',
    ]);
  }

  async deleteReply(user, botId, replyId) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const botRecord = await BotModel.findOne({
      _id: mongoose.Types.ObjectId(botId),
      $or: [
        { userCreated: userRecord._id },
        { userModerators: userRecord._id },
      ],
    });
    if (!botRecord) throw new BotNotFoundError();

    const deletedReplyRecord = await ReplyModel.findOneAndDelete({
      _id: mongoose.Types.ObjectId(replyId),
      botBelongs: botRecord._id,
    });
    if (!deletedReplyRecord) throw new ReplyNotFoundError();

    return _.pick(deletedReplyRecord, [
      '_id',
      'answer',
      'keywords',
      'botBelogs',
      'isActive',
      'createdAt',
    ]);
  }

  async editDefaultReply(user, botId, defaultReply) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new UserNotFoundError();
    if (!userRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const botRecord = await BotModel.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(botId),
        $or: [
          { userCreated: userRecord._id },
          { userModerators: userRecord._id },
        ],
      },
      {
        defaultReply,
      },
      { new: true }
    );
    if (!botRecord) throw new BotNotFoundError();

    return _.pick(botRecord, [
      '_id',
      'credentials.username',
      'isValid',
      'isActive',
      'replies',
      'defaultReply',
      'userCreated',
      'createdAt',
    ]);
  }

  //=========================Moderators=========================//

  async inviteModerator(userOwner, userToInviteEmail, botId) {
    if (userOwner.email == userToInviteEmail)
      throw new UserAlreadyExistError('🔥 Owner user cannot be invited');

    const userOwnerRecord = await UserModel.findById(userOwner.id);
    if (!userOwnerRecord) throw new UserNotFoundError();
    if (!userOwnerRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const userToInviteRecord = await UserModel.findOne({
      email: userToInviteEmail,
    });
    if (!userToInviteRecord) throw new UserNotFoundError();
    if (!userToInviteRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    let botRecord = await BotModel.findOne({
      id: mongoose.Types.ObjectId(botId),
      userCreated: userOwnerRecord._id,
      userModerators: { $nin: userToInviteRecord._id },
    });
    if (!botRecord)
      throw new BotNotFoundError(
        '🔥 Bot Not Found Or User is Already Moderator.'
      );

    userToInviteRecord.InvitedBots.push(botRecord._id);
    botRecord.userModerators.push(userToInviteRecord._id);

    await userToInviteRecord.save();
    await botRecord.save();

    botRecord = await BotModel.findById(botId)
      .populate({
        path: 'userCreated',
        model: 'User',
        select: '_id email firstName lastName',
      })
      .populate({
        path: 'userModerators',
        model: 'User',
        select: '_id email firstName lastName',
      })
      .select(
        '_id credentials.username isActive isValid defaultReply dateCreated'
      );

    return botRecord;
  }

  async removeModerator(userOwner, userToRemoveId, botId) {
    const userOwnerRecord = await UserModel.findOne({
      email: userOwner.email,
    });
    if (!userOwnerRecord) {
      throw new UserNotFoundError();
    }
    if (!userOwnerRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    const userToRemoveRecord = await UserModel.findById(userToRemoveId);
    if (!userToRemoveRecord) throw new UserNotFoundError();
    if (!userToRemoveRecord.isVerified)
      throw new PermissionError('🔥 User Is Not Verified.');

    let botRecord = await BotModel.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(botId),
        userCreated: userOwnerRecord._id,
        userModerators: { $eq: userToRemoveRecord._id },
      },
      {
        $pull: { userModerators: userToRemoveRecord._id },
      },
      { new: true }
    );

    if (!botRecord) throw new BotNotFoundError('🔥 Bot Not Found.');

    await UserModel.updateOne(
      { _id: userToRemoveRecord._id },
      { $pull: { InvitedBots: botRecord._id } }
    );

    botRecord = await BotModel.findById(botId)
      .populate({
        path: 'userCreated',
        model: 'User',
        select: '_id email firstName lastName',
      })
      .populate({
        path: 'userModerators',
        model: 'User',
        select: '_id email firstName lastName',
      })
      .select(
        '_id credentials.username isActive isValid defaultReply dateCreated'
      );
    return botRecord;
  }
};
