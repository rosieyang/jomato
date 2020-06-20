const express = require('express');
const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getMonthlyStats
} = require('../controllers/reviewController');

const Review = require('../models/reviewModel');

const router = express.Router({ mergeParams: true });

const advancedQuery = require('../middleware/advancedQuery');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/monthly-stats/:year', protect, restrictTo('owner', 'admin'), getMonthlyStats);

router
  .route('/')
  .get(advancedQuery(Review), getAllReviews)
  .post(protect, restrictTo('user'), createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(protect, restrictTo('user'), updateReview)
  .delete(protect, restrictTo('user', 'admin'), deleteReview);

module.exports = router;