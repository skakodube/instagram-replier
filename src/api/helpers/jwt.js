const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports.generateJWT = function (user) {
  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isVerified: user.isVerified,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '60 days',
  });
};
