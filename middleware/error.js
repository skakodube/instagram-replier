const logger = require("../loaders/logging");
const ServiceError = require("../errors/serviceError");

// 400 Bad Request – This means that client-side input fails validation.
// 401 Unauthorized – This means the user isn’t not authorized to access a resource. It usually returns when the user isn’t authenticated.
// 403 Forbidden – This means the user is authenticated, but it’s not allowed to access a resource.
// 404 Not Found – This indicates that a resource is not found.
// 500 Internal server error – This is a generic server error. It probably shouldn’t be thrown explicitly.
// 502 Bad Gateway – This indicates an invalid response from an upstream server.
// 503 Service Unavailable – This indicates that something unexpected happened on server side (It can be anything like server overload, some parts of the system failed, etc.).

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
      case "invalid auth token":
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
