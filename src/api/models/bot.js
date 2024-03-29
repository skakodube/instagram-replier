const mongoose = require('mongoose');
const UserModel = require('./user');
const BotSchema = new mongoose.Schema(
  {
    userCreated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profilePicture: String,
    credentials: {
      username: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
    },
    isValid: {
      type: Boolean,
      default: false,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
      required: true,
    },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }],
    defaultReply: {
      type: String,
      default: '',
    },
    userModerators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sessionCookies: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

BotSchema.pre('findOneAndDelete', async function (next) {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (!docToDelete) return;
  await UserModel.findOneAndUpdate(
    {
      OwnedBots: { $eq: docToDelete._id },
    },
    {
      $pull: { OwnedBots: docToDelete._id },
    }
  ).exec();
  await UserModel.updateMany(
    {
      InvitedBots: { $eq: docToDelete._id },
    },
    {
      $pull: { InvitedBots: docToDelete._id },
    },
    { multi: true }
  ).exec();
  next();
  // shorter way, but throws *circular depedency error*
  // await ReplyModel.deleteMany({ botBelongs: docToDelete._id }).exec();
});

module.exports = mongoose.model('Bot', BotSchema);
