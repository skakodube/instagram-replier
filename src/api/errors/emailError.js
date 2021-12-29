const ApplicationError = require('./applicationError');

module.exports = class EmailError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || '🔥 Email Was Not Sent.', 503, isOperational);
  }
};
