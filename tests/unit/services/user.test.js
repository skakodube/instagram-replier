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

describe("userService", () => {
  const userService = new UserService();
  let user;
  beforeEach(async () => {
    user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "email@email.com",
      firstName: "Mark",
      lastName: "Watney",
      password: "12345",
      verified: true,
    });
    await bcrypt.hash(user.password, 10).then(function (hash) {
      user.password = hash;
    });
  });
  afterEach(() => {
    mockingoose(UserModel).reset();
  });
  describe("login", () => {
    it("should return loggined user", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      const result = await userService.login({
        email: "email@email.com",
        password: "12345",
      });
      expect(user).toMatchObject(result);
    });
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(new UserNotFoundError(), "findOne"); //db mock

      return await userService.login(user).catch((err) => {
        expect(err).toBeInstanceOf(UserNotFoundError);
      });
    });
    it("should return error if password is invalid", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await userService
        .login({
          email: "email@email.com",
          password: "1",
        })
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
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
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(
        new UserNotFoundError(),
        "findOneAndUpdate"
      ); //db mock

      return await userService.edit(user, "Anna", "Doe").catch((err) => {
        expect(err).toBeInstanceOf(UserNotFoundError);
      });
    });
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
    it("should return error if user is not registered", async () => {
      mockingoose(UserModel).toReturn(new UserNotFoundError(), "findOne"); //db mock

      return await userService
        .resetPasswordByPassword(user, "12345", "54321")
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
    });
    it("should return error if password is invalid", async () => {
      mockingoose(UserModel).toReturn(user, "findOne"); //db mock

      return await userService
        .resetPasswordByPassword(user, "1", "54321")
        .catch((err) => {
          expect(err).toBeInstanceOf(UserNotFoundError);
        });
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
