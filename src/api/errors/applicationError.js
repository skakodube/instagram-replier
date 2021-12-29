module.exports = class ApplicationError extends Error {
  constructor(message, status, isOperational) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;

    this.message = message || '🔥 Something went wrong. Please try again.';

    this.status = status || 500;

    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
};
