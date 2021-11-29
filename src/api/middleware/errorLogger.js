const logger = require("../loaders/logging");

module.exports = function (error, req, res, next) {
  if (error.isOperational) {
    logger.error(error);
  } else {
    logger.error(error.stack);
  }
  next(error);
};
