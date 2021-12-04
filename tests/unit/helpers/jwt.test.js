/**
 * Tests Jwt helper
 *
 * @group unit/helpers/jwt
 */

const jwtHelper = require("../../../src/api/helpers/jwt");
const jwt = require("jsonwebtoken");
const config = require("../../../src/config/index");

describe("generateJWT", () => {
  it("should return a non-expired valid JWT", () => {
    const user = {
      email: "email@email.com",
      firstName: "Mark",
      lastName: "Watney",
    };
    const token = jwtHelper.generateJWT(user);
    const decoded = jwt.verify(token, config.jwtSecret);
    expect(decoded).toMatchObject(user);
  });
});
