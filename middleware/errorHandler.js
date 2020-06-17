const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  console.log(err.stack.red);

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message
  });
}

const sendErrorProd = (err, req, res) => {
  // 1) Operational, trusted error : Send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // 2) Programming or other unknown error : Don't leak error details
  console.error('💥 ERROR: ', err);
  return res.status(500).json({
    status: 'error',
    message: 'Oops, something went wrong!'
  });
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // if req.params.id is not in a proper format
    if (err.name === 'CastError') {
      error = new AppError(`Invalid ${error.path}: ${error.value}`, 404);
    }

    // if there is a duplicate key error
    if (err.code === 11000) {
      error = new AppError(`Duplicate name in same area: ${error.keyValue.name}. Please use another name!`, 400);
    }

    // if validation for model schema has failed
    if (err.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(error => error.message);
      error = new AppError(`Invalid input data: ${messages.join(' / ')}`, 400);
    }

    // if JWT token is invalid
    if (err.name === 'JsonWebTokenError') {
      error = new AppError('Invalid token. Please log in again!', 401);
    }

    // if JWT token has expired
    if (err.name === 'TokenExpiredError') {
      error = new AppError('Token has expired. Please log in again!', 401);
    }

    sendErrorProd(error, req, res);
  }
}