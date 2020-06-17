const crypto = require('crypto');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  // Send cookie only through HTTPS in production mode
  if (process.env.NODE_ENV === 'production') options.secure = true;

  res
    .status(statusCode)
    .cookie('jwt', token, options)
    .json({
      status: 'success',
      token
    });
}

// @desc        Signup user
// @route       POST /api/users/signup
// @access      Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 201, res);
});

// @desc        Login user
// @route       POST /api/users/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if user entered both email and password
  if (!email || !password) {
    return next(new AppError('Please provide an email and password!', 400));
  }

  // 2) Find user from DB with entered email
  const user = await User.findOne({ email }).select('+password');

  // 3) Check if user exists && password is correct
  if (!user || !await user.comparePassword(password)) {
    return next(new AppError('Email or password is incorrect!', 401));
  }

  // 4) Then, send JWT to client
  sendTokenResponse(user, 200, res);
});

// @desc        Update password
// @route       PATCH /api/users/update-password
// @access      Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // 1) Get user from User collection
  const user = await User.findById(req.user._id).select('+password');

  // 2) Check if user-entered current password is correct
  if (!await user.comparePassword(req.body.currentPassword)) {
    return next(new AppError('Current password is incorrect. Please try again.', 401));
  }

  // 3) Check if newPasswordConfirm is same as newPassword
  if (req.body.newPassword !== req.body.newPasswordConfirm) {
    return next(new AppError('Please confirm new password again.', 400));
  }

  // 4) If correct, update password
  user.password = req.body.newPassword;
  await user.save();

  // 5) Log user in, and send JWT
  sendTokenResponse(user, 200, res);
});

// @desc        Forgot password
// @route       POST /api/users/forgot-password
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError(`User with entered email is not found`, 404));
  }

  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  console.log('resetToken: ', resetToken.blue);

  try {
    // TODO: Send email

    res.status(200).json({
      status: 'success',
      message: 'Token has been sent to email.'
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error occurred sending an email. Please try again!', 500));
  }
});

// @desc        Reset password
// @route       PATCH /api/users/reset-password/:resetToken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // 2) Get a user based on hashed token
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  // 3) Check if newPasswordConfirm is same as newPassword
  if (req.body.newPassword !== req.body.newPasswordConfirm) {
    return next(new AppError('Please confirm new password again.', 400));
  }

  // 4) If correct, update password
  user.password = req.body.newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // 5) Log user in, and send JWT
  sendTokenResponse(user, 200, res);
});