const sgMail = require("@sendgrid/mail");
const UserModel = require("../models/user");
const ServiceError = require("../errors/serviceError");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const emailFrom = "instagram.replier@gmail.com";
const verificationTemplate = "d-a4049454ef304608b860316272e372a5";
const resetPasswordTemplate = "d-8c338d1c57514441924f40efe53138f5";
const changeEmailTemplate = "d-c4ee6501a9f646a8ab40f566b38f1f81";
const changeEmailNoticeTemplate = "d-3bf1a7ecc66648d4bf4643dc0ee1c60f";

module.exports = class EmailService {
  async sendVerificationEmail(user, confirmLink) {
    //TODO:
    //Send OK return or send email to unregistered?
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

    userRecord.generateReset();
    await userRecord.save();

    let msg = {
      to: userRecord.email,
      from: emailFrom,
      dynamic_template_data: {
        link:
          //confirmLink +
          "https://instagram.replier.com/account/confirm/" +
          userRecord.resetToken,
      },
      template_id: verificationTemplate,
    };

    await sgMail.send(msg).catch(() => {
      throw new ServiceError("couldn't send an email");
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
        link:
          //resetLink +
          "https://instagram.replier.com/account/reset/" +
          userRecord.resetToken,
      },
      template_id: resetPasswordTemplate,
    };

    await sgMail.send(msg).catch(() => {
      throw new ServiceError("couldn't send an email");
    });
  }

  async sendChangeAndNoticeEmails(user, password, newEmail) {
    let userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("invalid email or password");

    let userRecordTemp = await UserModel.findOne({
      email: newEmail,
    });
    if (userRecordTemp) throw new ServiceError("email is already registered");

    const validPassword = await userRecord.comparePassword(password);
    if (!validPassword) throw new ServiceError("invalid email or password");

    userRecord.generateReset();
    userRecord.tempEmail = newEmail;
    await userRecord.save();

    let msg = {
      to: userRecord.tempEmail,
      from: emailFrom,
      dynamic_template_data: {
        newEmail: userRecord.tempEmail,
        link:
          //resetLink +
          "https://instagram.replier.com/account/email/" +
          userRecord.resetToken,
      },
      template_id: changeEmailTemplate,
    };

    await sgMail.send(msg).catch(() => {
      throw new ServiceError("couldn't send an email");
    });

    msg = {
      to: userRecord.email,
      from: emailFrom,
      dynamic_template_data: {
        newEmail: userRecord.tempEmail,
      },
      template_id: changeEmailNoticeTemplate,
    };

    await sgMail.send(msg).catch(() => {
      throw new ServiceError("couldn't send an email");
    });
  }
};
