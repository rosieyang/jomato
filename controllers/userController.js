const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');

// @desc        Get all users
// @route       GET /api/users
// @access      Private (only for admin)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedQuery);
});

// @desc        Get single user
// @route       GET /api/users/:id
// @access      Private (only for admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError(`A user with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc        Create new user
// @route       POST /api/users
// @access      Private (only for admin)
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: user
  });
});

// @desc        Update user
// @route       PATCH /api/users/:id
// @access      Private (only for admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new AppError(`A user with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc        Delete user
// @route       DELETE /api/users/:id
// @access      Private (only for admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError(`A user with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc        Get logged in user
// @route       GET /api/users/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc        Update logged in user's name or email
// @route       PATCH /api/users/me
// @access      Private
exports.updateMe = asyncHandler(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError("This route is not for updating password. Please use route '/update-password' instead.", 400));
  }

  const allowedBody = {
    name: req.body.name || req.user.name,
    email: req.body.email || req.user.email
  }

  const user = await User.findByIdAndUpdate(req.user._id, allowedBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc        Deactivate logged in user
// @route       DELETE /api/users/me
// @access      Private
exports.deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(200).json({
    status: 'success',
    message: 'Your account has been deleted successfully!'
  });
});