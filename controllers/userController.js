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