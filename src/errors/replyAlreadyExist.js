const ApplicationError = require("./ApplicationError");

module.exports = class ReplyAlreadyExistError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || "Reply Already Exist.", 400, isOperational);
  }
};
