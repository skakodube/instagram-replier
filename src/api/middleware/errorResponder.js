module.exports = function (error, req, res, next) {
  if (error.isOperational) {
    //typeof ApplicationError not work

    error.message = error.message.replace('🔥 ', '');

    res.status(error.status).send(error);
  } else next(error);
};
