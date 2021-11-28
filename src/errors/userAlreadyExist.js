const ApplicationError = require("./ApplicationError");

module.exports = class UserAlreadyExistError extends ApplicationError {
  constructor(message, status, isOperational = true) {
    super(message || "User Already Exist.", 400, isOperational);
  }
};
