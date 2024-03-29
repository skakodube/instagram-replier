const sgMail = require('@sendgrid/mail');
const UserModel = require('../models/user');
const EmailError = require('../errors/emailError');
const UserNotFoundError = require('../errors/userNotFound');
const config = require('../../config');

sgMail.setApiKey(config.emails.apiKey);
const verificationTemplate = config.emails.verificationTemplate;
const resetPasswordTemplate = config.emails.recoverTemplate;
const changeEmailNoticeTemplate = config.emails.noticeTemplate;
const emailFrom = config.emails.apiSender;
const linkToFront = config.linkToFront;

module.exports = class EmailService {
  async sendVerificationEmail(email) {
    const userRecord = await UserModel.findOne({
      email,
    });
    if (!userRecord) throw new UserNotFoundError();

    userRecord.generateReset();
    await userRecord.save();

    let msg = {
      to: userRecord.email,
      from: emailFrom,
      dynamic_template_data: {
        user_name: userRecord.firstName,
        Weblink: linkToFront + '/account/confirm/' + userRecord.resetToken,
      },
      template_id: verificationTemplate,
    };

    await sgMail.send(msg).catch((error) => {
      throw new EmailError(error);
    });
  }

  async sendRecoverPasswordEmail(email) {
    const userRecord = await UserModel.findOne({
      email: email,
    });
    if (!userRecord) throw new UserNotFoundError();

    userRecord.generateReset();
    await userRecord.save();

    let msg = {
      to: userRecord.email,
      from: emailFrom,
      dynamic_template_data: {
        Weblink:
          linkToFront + '/accounts/password/reset/' + userRecord.resetToken,
      },
      template_id: resetPasswordTemplate,
    };

    await sgMail.send(msg).catch((error) => {
      throw new EmailError(error);
    });
  }

  async sendChangeNoticeEmail(email, oldEmail) {
    let msg = {
      to: oldEmail,
      from: emailFrom,
      dynamic_template_data: {
        newEmail: email,
      },
      template_id: changeEmailNoticeTemplate,
    };

    await sgMail.send(msg).catch((error) => {
      throw new EmailError(error);
    });
  }
};
