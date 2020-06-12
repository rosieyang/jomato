const express = require('express');
const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const Review = require('../models/reviewModel');

const router = express.Router({ mergeParams: true });

const advancedQuery = require('../middleware/advancedQuery');

router
  .route('/')
  .get(advancedQuery(Review), getAllReviews)
  .post(createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;