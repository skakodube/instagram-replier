/**
 * Tests User service
 *
 * @group unit/services/user
 */

const mongoose = require("mongoose");
const mockingoose = require("mockingoose");
const UserModel = require("../../../src/api/models/user");
const UserNotFoundError = require("../../../src/api/errors/userNotFound");
const UserAlreadyExistError = require("../../../src/api/errors/userAlreadyExist");
const InvalidTokenError = require("../../../src/api/errors/invalidToken");
const UserService = require("../../../src/api/services/userService");
const bcrypt = require("bcrypt");

const userService = new UserService();
let user;

async function runTestUserNotFound(callback, strDbMock = "findOne") {
  it("should return error if user is not registered", async () => {
    mockingoose(UserModel).toReturn(new UserNotFoundError(), strDbMock); //db mock

    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(UserNotFoundError);
    });
  });
}
async function runTestInvalidPassword(callback) {
  it("should return error if password is invalid", async () => {
    mockingoose(UserModel).toReturn(user, "findOne"); //db mock

    return await callback().catch((err) => {
      expect(err).toBeInstanceOf(UserNotFoundError);
    });
  });
}

describe("userService", () => {
  beforeEach(async () => {
    user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "email@email.com",
      firstName: "Mark",
      lastName: "Watney",
      password: "12345",
      isVerified: true,
    });
    await bcrypt.hash(user.password, 10).then(function (hash) {
      user.password = hash;
    });
  });
  afterEach(() => {
    mockingoose(UserModel).reset();
  });
  describe("login", () => {
    it("should return logined user", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      const result = await userService.login({
        email: "email@email.com",
        password: "12345",
      });
      expect(user).toMatchObject(result);
    });
    runTestUserNotFound(async function () {
      await userService.login(user);
    });
    runTestInvalidPassword(async function () {
      await userService.login({
        email: "email@email.com",
        password: "1",
      });
    });
  });
  describe("signup", () => {
    it("should return newly registered user", async () => {
      mockingoose(UserModel).toReturn(null, "findOne"); //db mock
      const result = await userService.signup({
        firstName: "name",
        lastName: "surname",
        email: "email@email.com",
        password: "12345",
      });
      expect(result).toHaveProperty("_id");
    });
    it("should return error if user with this email is already registered", async () => {
      mockingoose(UserModel).toReturn(new UserAlreadyExistError(), "findOne"); //db mock

      return await userService
        .signup({
          firstName: "name",
          lastName: "surname",
          email: "email@email.com",
          password: "12345",
        })
        .catch((err) => {
          expect(err).toBeInstanceOf(UserAlreadyExistError);
        });
    });
  });
  describe("edit", () => {
    it("should return newly edited user", async () => {
      user.firstName = "Anna";
      user.lastName = "Doe";
      mockingoose(UserModel).toReturn(user, "findOneAndUpdate"); //db mock
      const result = await userService.edit(user, "Anna", "Doe");
      expect(result).toHaveProperty("firstName", "Anna");
      expect(result).toHaveProperty("lastName", "Doe");
    });
    runTestUserNotFound(async function () {
      await userService.edit(user, "Anna", "Doe");
    }, "findOneAndUpdate");
  });
  describe("resetPasswordByPassword", () => {
    it("should reset password if password is correct", async () => {
      const oldPassword = user.password;
      const newPassword = "54321";
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      await userService.resetPasswordByPassword(user, "12345", newPassword);
      await bcrypt.hash(newPassword, 10).then(function (hash) {
        user.password = hash;
      });
      expect(newPassword).not.toBe(oldPassword);
    });
    runTestUserNotFound(async function () {
      await userService.resetPasswordByPassword(user, "12345", "54321");
    });
    runTestInvalidPassword(async function () {
      await userService.resetPasswordByPassword(user, "12345", "54321");
    });
  });
  describe("recoverPasswordByEmailtoken", () => {
    it("should reset password if token is correct", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      await userService.recoverPasswordByEmailtoken("a", "54321");
      const result = await user.comparePassword("54321");
      expect(result).toBe(true);
    });

    it("should return error if token is invalid", async () => {
      mockingoose(UserModel).toReturn(new InvalidTokenError(), "findOne"); //db mock

      return await userService
        .recoverPasswordByEmailtoken("a", "54321")
        .catch((err) => {
          expect(err).toBeInstanceOf(InvalidTokenError);
        });
    });
  });

  //   describe("changeEmail", () => {
  //NON TESTABLE
  // it("should return user with changed email, if password is correct", async () => {
  //   mockingoose(UserModel).toReturn(user, "findOne"); //db mock
  //   const result = await userService.changeEmail(
  //     user,
  //     "newemail@email.com",
  //     "12345"
  //   );
  //   expect(result).toHaveProperty("_id", user._id);
  //   expect(result).toHaveProperty("email", "newemail@email.com");
  //    });
  // });
});
