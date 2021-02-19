const jwt = require("jsonwebtoken");

module.exports.generateJWT = function (user) {
  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  return jwt.sign(payload, process.env.JWT_PRIVATE_KEY, {
    expiresIn: "60 days",
  });
};
