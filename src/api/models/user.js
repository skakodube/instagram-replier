const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      require: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 320,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    OwnedBots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }],
    InvitedBots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bot' }],
    resetToken: {
      type: String,
      required: false,
    },
    resetExpires: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateReset = function () {
  this.resetToken = crypto.randomBytes(20).toString('hex');
  this.resetExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; //expires in a week
};

module.exports = mongoose.model('User', UserSchema);
