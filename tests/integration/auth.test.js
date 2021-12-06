/**
 * Tests Auth route
 *
 * @group integration/routes/auth
 */

const request = require("supertest");
const app = require("../../src/app");
const UserModel = require("../../src/api/models/user");
const jwtHelper = require("../../src/api/helpers/jwt");

describe("/auth", () => {
  let user, authToken;
  beforeAll(async () => {
    user = new UserModel({
      firstName: "Mark",
      lastName: "Watney",
      email: "email@email.com",
      password: "12345",
      isVerified: true,
    });
    user.password = "12345";
    await user.save();
    authToken = jwtHelper.generateJWT(user);
  });
  afterAll(async () => {
    await UserModel.deleteMany({});
  });
  test("POST/login", (done) => {
    request(app)
      .post("/auth/login")
      .set("x-auth-token", authToken)
      .send({
        email: "email@email.com",
        password: "12345",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.user._id).toEqual(user._id.toString());
        return done();
      });
  });
  test("POST/signup", (done) => {
    request(app)
      .post("/auth/signup")
      .send({
        firstName: "Anna",
        lastName: "Doe",
        email: "email2@email.com",
        password: "12345",
        verificationLink: "link",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.user.email).toEqual("email2@email.com");
        expect(res.body.user.firstName).toEqual("Anna");
        return done();
      });
  });
});
