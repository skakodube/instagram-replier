module.exports = class ServiceError extends (
  Error
) {
  constructor(message, status) {
    super(message);
  }
};
