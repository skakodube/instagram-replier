const ServiceError = require("../errors/serviceError");

module.exports = function (req, res, next) {
  //401 Unauthorized
  //403 Forbidden

  if (!req.user.isAdmin) throw new ServiceError("access denied");
};
