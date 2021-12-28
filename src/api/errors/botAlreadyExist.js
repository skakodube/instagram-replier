const ApplicationError = require("./applicationError");

module.exports = class BotAlreadyExistError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || "🔥 Bot Already Exist.", 400, isOperational);
  }
};
