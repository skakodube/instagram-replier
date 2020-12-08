const ServiceError = require("../errors/serviceError");
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) throw new ServiceError("access denied");

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    throw new ServiceError("invalid token");
  }
};
