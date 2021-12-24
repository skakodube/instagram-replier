/**
 * Tests User model
 *
 * @group unit/models/user
 */

const mongoose = require("mongoose");
const UserModel = require("../../../src/api/models/user");
const bcrypt = require("bcrypt");

describe("user.comparePassword", () => {
  it("should return true if password is correct", async () => {
    password = "12345";
    const user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "skakodube@gmail.com",
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
  it("should set reset token to randomString of 40 and token expiration to 7 days", () => {
    const user = new UserModel({
      _id: new mongoose.Types.ObjectId().toHexString(),
      email: "skakodube@gmail.com",
      firstName: "Mark",
      lastName: "Watney",
      password: "12345",
    });

    user.generateReset();
    const result =
      user.resetExpires >= Date.now() &&
      user.resetExpires < Date.now() + 8 * 24 * 60 * 60 * 1000; //less than 8 days
    expect(user.resetToken).toMatch(/([A-Za-z0-9]{0,40})\w+/);
    expect(result).toBe(true);
  });
});
