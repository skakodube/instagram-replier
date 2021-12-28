const ApplicationError = require("./applicationError");

module.exports = class BotNotFoundError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || "🔥 No Bot found.", 404, isOperational);
  }
};
