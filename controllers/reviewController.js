const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');
const Restaurant = require('../models/restaurantModel');
const Review = require('../models/reviewModel');

// @desc        Get all reviews
// @route       GET /api/reviews
// @route       GET /api/restaurants/:restaurantId/reviews
// @access      Public
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  if (req.params.restaurantId) {
    const reviews = await Review.find({ restaurant: req.params.restaurantId });

    return res.status(200).json({
      status: 'success',
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedQuery);
  }
});

// @desc        Get single review
// @route       GET /api/reviews/:id
// @route       GET /api/restaurants/:restaurantId/reviews/:id
// @access      Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError(`A review with the id of '${req.params.id}' is not found.`, 404));
  }

  if (req.params.restaurantId) {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return next(new AppError(`A restaurant with the id of '${req.params.restaurantId}' is not found.`, 404));
    }

    if (req.params.restaurantId != review.restaurant) {
      return next(new AppError(`A review with the id of '${req.params.id}' doesn't belong to this restaurant.`, 400));
    }
  }

  res.status(200).json({
    status: 'success',
    data: review
  });
});

// @desc        Create new review
// @route       POST /api/reviews
// @route       POST /api/restaurants/:restaurantId/reviews
// @access      Private
exports.createReview = asyncHandler(async (req, res, next) => {
  if (!req.body.restaurant && !req.params.restaurantId) {
    return next(new AppError('Please provide a restaurant the review belongs to', 400));
  }

  if (!req.body.restaurant) {
    req.body.restaurant = req.params.restaurantId;
  }

  const restaurant = await Restaurant.findById(req.body.restaurant);

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.body.restaurant}' is not found.`, 404));
  }

  req.body.user = req.user._id;

  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: review
  });
});

// @desc        Update review
// @route       PATCH /api/reviews/:id
// @route       PATCH /api/restaurants/:restaurantId/reviews/:id
// @access      Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError(`A review with the id of '${req.params.id}' is not found.`, 404));
  }

  if (req.params.restaurantId) {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (review.restaurant != restaurant.id) {
      return next(new AppError(`This review doesn't belong to the restaurant '${restaurant.id}'`, 404));
    }
  }

  // Check if this review belongs to current user
  if (review.user != req.user.id) {
    return next(new AppError("You're not authorized to update this review.", 401));
  }

  // To prevent from updating user field manually
  req.body.user = req.user._id;

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: review
  });
});

// @desc        Delete review
// @route       DELETE /api/reviews/:id
// @route       DELETE /api/restaurants/:restaurantId/reviews/:id
// @access      Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError(`A review with the id of '${req.params.id}' is not found.`, 404));
  }

  if (req.params.restaurantId) {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (review.restaurant != restaurant.id) {
      return next(new AppError(`This review doesn't belong to the restaurant '${restaurant.id}'`, 404));
    }
  }

  // Check if this review belongs to current user or a user is admin
  if (review.user != req.user.id && req.user.role !== 'admin') {
    return next(new AppError("You're not authorized to delete this review.", 401));
  }

  await review.remove();

  res.status(200).json({
    status: 'success',
    message: 'A review has been deleted successfully!'
  });
});

// @desc        Get aggregation for reviews by monthly activity
// @route       GET /api/reviews/monthly-stats/:year
// @access      Private
exports.getMonthlyStats = asyncHandler(async (req, res, next) => {
  // Convert string to number
  const year = req.params.year * 1;

  const monthly = await Review.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        numReviewsCreated: { $sum: 1 }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numReviewsCreated: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { monthly }
  });
});