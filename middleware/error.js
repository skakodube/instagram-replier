const logger = require("../loaders/logging");
const ServiceError = require("../errors/serviceError");

module.exports = function (err, req, res, next) {
  if (err instanceof ServiceError) {
    let statusCode;
    switch (err.message) {
      case "invalid email or password":
        statusCode = 404;
        break;
      case "user doesn't exist":
        statusCode = 404;
        break;
      case "access denied":
        statusCode = 403;
        break;
      case "user is not verified":
        statusCode = 403;
        break;
      case "email is already registered":
        statusCode = 400;
        break;
      case "user already registered":
        statusCode = 400;
        break;
      case "Password reset token is invalid or has expired":
        statusCode = 401;
        break;
      case "invalid token":
        statusCode = 400;
        break;
      case "couldn't send an email":
        statusCode = 400;
        break;
      default:
        statusCode = 405;
    }

    res.status(statusCode).send({
      error: err.message,
    });
  } else {
    logger.error(err.stack || "Undefined Error");
    res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};
