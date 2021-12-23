/**
 * Tests Email service
 *
 * @group unit/services/email
 */

const mongoose = require("mongoose");
const mockingoose = require("mockingoose");
const UserModel = require("../../../src/api/models/user");
const UserNotFoundError = require("../../../src/api/errors/userNotFound");
const EmailService = require("../../../src/api/services/emailService");

const emailService = new EmailService();
let user;

async function runTestSendVerificationEmail(callback) {
  it("should generate token for user, if email is valid", async () => {
    mockingoose(UserModel).toReturn(user, "findOne"); //db mock

    await callback();
    expect(user).toHaveProperty("resetToken");
    expect(user).toHaveProperty("resetExpires");
  });
}
async function runTestEmailNotFound(callback) {
  it("should return error if email is not registered", async () => {
    mockingoose(UserModel).toReturn(new UserNotFoundError(), "findOne"); //db mock
    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(UserNotFoundError);
    });
  });
}

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
    runTestSendVerificationEmail(async function () {
      await emailService.sendVerificationEmail(user.email, "link");
    });
    runTestEmailNotFound(async function () {
      await emailService.sendVerificationEmail("a", "link");
    });
  });
  describe("sendRecoverPasswordEmail", () => {
    runTestSendVerificationEmail(async function () {
      await emailService.sendRecoverPasswordEmail(user.email, "link");
    });
    runTestEmailNotFound(async function () {
      await emailService.sendVerificationEmail("a", "link");
    });
  });
});
