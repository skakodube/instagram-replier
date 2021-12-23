/**
 * Tests User route
 *
 * @group integration/routes/user
 */

const request = require("supertest");
const app = require("../../src/app");
const UserModel = require("../../src/api/models/user");
const jwtHelper = require("../../src/api/helpers/jwt");

describe("/user", () => {
  let user, authToken;
  beforeEach(async () => {
    user = new UserModel({
      firstName: "Mark",
      lastName: "Watney",
      email: "skakodube@gmail.com",
      password: "12345",
      isVerified: true,
    });
    user.password = "12345";
    await user.save();
    authToken = jwtHelper.generateJWT(user);
  });
  afterEach(async () => {
    await UserModel.deleteMany({});
  });
  test("PUT/", (done) => {
    request(app)
      .put("/user")
      .set("x-auth-token", authToken)
      .send({
        firstName: "Anna",
        lastName: "Doe",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.user.firstName).toEqual("Anna");
        return done();
      });
  });

  test("PATCH/reset-password", (done) => {
    const oldUserPassoword = user.password;
    request(app)
      .patch("/user/reset-password")
      .set("x-auth-token", authToken)
      .send({
        oldPassword: "12345",
        newPassword: "54321",
      })
      .expect(200)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        await UserModel.findOne({ email: user.email }).then((res) => {
          expect(res.password).not.toEqual(oldUserPassoword);
        });
        return done();
      });
  });

  test("PATCH/change-email", (done) => {
    request(app)
      .patch("/user/change-email")
      .set("x-auth-token", authToken)
      .send({
        password: "12345",
        newEmail: "newemail@email.com",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.user.email).toEqual("newemail@email.com");
        return done();
      });
  });

  test("GET/send-activate-email", (done) => {
    request(app)
      .get("/user/send-activate-email")
      .set("x-auth-token", authToken)
      .send({
        link: "link1",
      })
      .expect(200, done);
  });

  test("PATCH/activate-account", (done) => {
    user.isVerified = false;
    user.generateReset();
    user.save();

    request(app)
      .patch("/user/activate-account")
      .set("x-auth-token", authToken)
      .send({
        token: user.resetToken,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.user.isVerified).toEqual(true);
        return done();
      });
  });

  test("GET/send-recover-email", (done) => {
    request(app)
      .get("/user/send-recover-email")
      .send({
        email: "email@email.com",
        link: "link1",
      })
      .expect(200, done);
  });

  test("PATCH/recover-password", (done) => {
    const oldUserPassoword = user.password;

    user.generateReset();
    user.save();

    request(app)
      .patch("/user/recover-password")
      .send({
        token: user.resetToken,
        password: "54321",
      })
      .expect(200)
      .end(async (err, res) => {
        if (err) {
          return done(err);
        }
        await UserModel.findOne({ email: user.email }).then((res) => {
          expect(res.password).not.toEqual(oldUserPassoword);
        });
        return done();
      });
  });
});
