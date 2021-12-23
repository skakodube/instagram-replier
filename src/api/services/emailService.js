const sgMail = require("@sendgrid/mail");
const UserModel = require("../models/user");
const EmailError = require("../errors/emailError");
const UserNotFoundError = require("../errors/userNotFound");
const config = require("../../config");

sgMail.setApiKey(config.emails.apiKey);
const verificationTemplate = "d-ca65d168fe664892932fa88d075dedbb";
const resetPasswordTemplate = "d-12526fb4c21549d8901548fdfe19ae43";
const changeEmailNoticeTemplate = "d-337ff99209a54ca89f99680fb9620c4d";
const emailFrom = config.emails.apiSender;

module.exports = class EmailService {
  async sendVerificationEmail(email, confirmLink) {
    //TODO:
    //Send OK return or send email to unregistered?
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
        Weblink:
          //confirmLink +
          "https://instagram.replier.com/account/confirm/" +
          userRecord.resetToken,
      },
      template_id: verificationTemplate,
    };

    await sgMail.send(msg).catch((error) => {
      throw new EmailError(error);
    });
  }

  async sendRecoverPasswordEmail(email, resetLink) {
    //TODO:
    //Send OK return or send email to unregistered?
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
          //resetLink +
          "https://instagram.replier.com/account/reset/" +
          userRecord.resetToken,
      },
      template_id: resetPasswordTemplate,
    };

    await sgMail.send(msg).catch((error) => {
      throw new EmailError(error);
    });
  }

  async sendChangeNoticeEmail(user, oldEmail) {
    let msg = {
      to: oldEmail,
      from: emailFrom,
      dynamic_template_data: {
        newEmail: user.email,
      },
      template_id: changeEmailNoticeTemplate,
    };

    await sgMail.send(msg).catch((error) => {
      throw new EmailError(error);
    });
  }
};
