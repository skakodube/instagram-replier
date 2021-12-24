/**
 * Tests Email service
 *
 * @group unit/services/email
 */

const mongoose = require("mongoose");
const mockingoose = require("mockingoose");
const UserModel = require("../../../src/api/models/user");
const UserNotFoundError = require("../../../src/api/errors/userNotFound");
const EmailError = require("../../../src/api/errors/emailError");
const EmailService = require("../../../src/api/services/emailService");
const sgMail = require("@sendgrid/mail");
const emailService = new EmailService();

async function runTestSendEmail(callback) {
  it("should generate token for user, if email is valid", async () => {
    sgMail.send = jest.fn().mockResolvedValue();
    mockingoose(UserModel).toReturn(user, "findOne"); //db mock

    await callback();
    expect(user).toHaveProperty("resetToken");
    expect(user).toHaveProperty("resetExpires");
  });
}
async function runTestUserNotFound(callback) {
  it("should return error if user is not registered", async () => {
    sgMail.send = jest.fn().mockResolvedValue();

    mockingoose(UserModel).toReturn(undefined, "findOne"); //db mock

    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(UserNotFoundError);
    });
  });
}
async function runTestEmailError(callback) {
  it("should return error if email is not registered", async () => {
    sgMail.send = jest.fn().mockRejectedValue(new EmailError());
    mockingoose(UserModel).toReturn(user, "findOne"); //db mock
    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(EmailError);
    });
  });
}

let user;
describe("emailService", () => {
  beforeEach(() => {
    user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "skakodube@gmail.com",
      firstName: "Mark",
      lastName: "Watney",
      password: "12345",
      isVerified: true,
    });
  });
  afterEach(() => {
    mockingoose(UserModel).reset();
  });
  describe("sendVerificationEmail", () => {
    runTestSendEmail(async function () {
      await emailService.sendVerificationEmail(user.email, "link");
    });
    runTestEmailError(async function () {
      await emailService.sendVerificationEmail(user.email, "link");
    });
    // runTestUserNotFound(async function () {
    //   await emailService.sendVerificationEmail(user.email, "link");
    // });
    it("should return error if user is not registered", async () => {
      sgMail.send = jest.fn().mockResolvedValue();

      mockingoose(UserModel).toReturn(undefined, "findOne"); //db mock

      return await emailService
        .sendVerificationEmail(user.email, "link")
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
  });
  describe("sendRecoverPasswordEmail", () => {
    runTestSendEmail(async function () {
      await emailService.sendRecoverPasswordEmail(user.email, "link");
    });
    runTestEmailError(async function () {
      await emailService.sendRecoverPasswordEmail(user.email, "link");
    });
    runTestUserNotFound(async function () {
      await emailService.sendRecoverPasswordEmail(user.email, "link");
    });
  });
  describe("sendChangeNoticeEmail", () => {
    runTestEmailError(async function () {
      await emailService.sendChangeNoticeEmail(
        user.email,
        "oldemail@email.com"
      );
    });
  });
});
