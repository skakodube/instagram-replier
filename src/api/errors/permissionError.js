const ApplicationError = require("./ApplicationError");

module.exports = class PermissionError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || "🔥 Access denied.", 403, isOperational);
  }
};
