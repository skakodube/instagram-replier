const ApplicationError = require('./applicationError');

module.exports = class ReplyNotFoundError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || '🔥 No Reply found.', 404, isOperational);
  }
};
