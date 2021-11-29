const jwt = require("jsonwebtoken");
const config = require("../../config");

module.exports.generateJWT = function (user) {
  //some more parameters?
  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: "60 days",
  });
};
