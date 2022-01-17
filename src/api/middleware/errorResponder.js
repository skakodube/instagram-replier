module.exports = function (error, req, res, next) {
  //typeof ApplicationError not work
  if (error.isOperational) {
    error.message = error.message.replace('🔥 ', '');

    res.status(error.status).send(error);
  } else next(error);
};
