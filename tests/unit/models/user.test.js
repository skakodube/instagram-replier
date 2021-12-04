/**
 * Tests User model
 *
 * @group unit/models/user
 */

const mongoose = require("mongoose");
const UserModel = require("../../../src/api/models/user");
const bcrypt = require("bcrypt");
const { describe } = require("jest-circus");

describe("user.comparePassword", () => {
  it("should return true if password is correct", async () => {
    password = "12345";
    const user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "email@email.com",
      firstName: "Mark",
      lastName: "Watney",
    });

    await bcrypt.hash(password, 10).then(function (hash) {
      user.password = hash;
    });

    const res = await user.comparePassword(password);
    expect(res).toBe(true);
  });
});

describe("user.generateReset", () => {
  it("should set resetToken to randomString of 40", () => {
    const user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "email@email.com",
      firstName: "Mark",
      lastName: "Watney",
      password: "12345",
    });

    user.generateReset();
    expect(user.resetToken).toMatch(/([A-Za-z0-9]{0,40})\w+/);
  });

  it("should set token expiration to 1 hour", () => {
    const user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "email@email.com",
      firstName: "Mark",
      lastName: "Watney",
      password: "12345",
    });

    user.generateReset();
    const result = user.resetExpires >= Date.now();
    expect(result).toBe(true);
  });
});
