const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

// Grant access only to user with valid token
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exists
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please log in to get access', 401));
  }

  try {
    // 2) Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user exists and grant access to protected route
    req.user = await User.findById(decodedToken.id);

    next();
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again', 401));
  }
});

// Grant access to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You're not authorized to access this route", 403));
    }

    next();
  }
}