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
      case "user already registered":
        statusCode = 400;
        break;
      case "invalid token":
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
