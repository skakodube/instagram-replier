const ApplicationError = require('./applicationError');

module.exports = class UserNotFoundError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || '🔥 No User found.', 404, isOperational);
  }
};
