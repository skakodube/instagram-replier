const sgMail = require("@sendgrid/mail");
const UserModel = require("../models/user");
const ServiceError = require("../errors/serviceError");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const welcomeTemplate = "d-a4049454ef304608b860316272e372a5";
const emailFrom = "instagram.replier@gmail.com";

module.exports = class EmailService {
  async sendVerificationEmail(user) {
    const userRecord = await UserModel.findOne({
      email: user.email,
    });
    if (!userRecord) throw new ServiceError("user doesn't exist");

    let msg = {
      to: userRecord.email,
      from: emailFrom,
      dynamic_template_data: {
        name: userRecord.name,
      },
      template_id: welcomeTemplate,
    };

    await sgMail.send(msg).catch(() => {
      throw new ServiceError("couldn't send an email");
    });
  }
};
