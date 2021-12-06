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

describe("emailService", () => {
  const emailService = new EmailService();
  let user;
  beforeEach(() => {
    user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "email@email.com",
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
    it("should generate token for user, if email is valid", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      await emailService.sendVerificationEmail(user.email, "link");
      expect(user).toHaveProperty("resetToken");
      expect(user).toHaveProperty("resetExpires");
    });
    it("should return error if email is not registered", async () => {
      mockingoose(UserModel).toReturn(new UserNotFoundError(), "findOne"); //db mock
      return await emailService
        .sendVerificationEmail("a", "link")
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
  });
  describe("sendRecoverPasswordEmail", () => {
    it("should generate token for user, if email is valid", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      await emailService.sendRecoverPasswordEmail(user.email, "link");
      expect(user).toHaveProperty("resetToken");
      expect(user).toHaveProperty("resetExpires");
    });
    it("should return error if email is not registered", async () => {
      mockingoose(UserModel).toReturn(new UserNotFoundError(), "findOne"); //db mock
      return await emailService
        .sendRecoverPasswordEmail("a", "link")
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
  });
});
