const sgMail = require("@sendgrid/mail");
const UserModel = require("../models/user");
const EmailError = require("../errors/emailError");
const UserNotFoundError = require("../errors/userNotFound");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const emailFrom = "instagram.repliers@gmail.com";
const verificationTemplate = "d-07c92790d29b4f82a22ef1b711c20190";
const resetPasswordTemplate = "d-c8e41e53a34c4c7e90baca21f2014c0d";
const changeEmailNoticeTemplate = "d-09c1910ee1944f4b8a2ea699cd43ddd6";

module.exports = class EmailService {
  async sendVerificationEmail(user, confirmLink) {
    //TODO:
    //Send OK return or send email to unregistered?
    const userRecord = await UserModel.findOne({
      email: user.email,
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
    if (!userRecord) return;

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
