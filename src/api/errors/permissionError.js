const ApplicationError = require("./applicationError");

module.exports = class PermissionError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || "🔥 Access denied.", status || 403, isOperational);
  }
};
