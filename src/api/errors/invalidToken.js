const ApplicationError = require("./applicationError");

module.exports = class InvalidTokenError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || "🔥 Token Is Invalid or Has Expired.", 404, isOperational);
  }
};
