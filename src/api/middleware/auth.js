const PermissionError = require('../errors/permissionError');
const jwt = require('jsonwebtoken');
const config = require('../../config');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) throw new PermissionError('JWT Token Is Invalid.', 401);

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    throw new PermissionError('Invalid Auth Token.', 401);
  }
};
