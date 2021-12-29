const PermissionError = require('../errors/permissionError');

module.exports = function (req, res, next) {
  if (!req.user.isAdmin) throw new PermissionError();
  //next?
};
