const express = require('express');
const {
  getAllRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsWithin,
  getDistances,
  getStatsBySuburb,
  getStatsByCuisine,
  getMonthlyStats,
  top5BySuburb,
  top5ByCuisine
} = require('../controllers/restaurantController');

const Restaurant = require('../models/restaurantModel');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

const advancedQuery = require('../middleware/advancedQuery');
const { protect, restrictTo } = require('../middleware/auth');

// Re-route to other routers
router.use('/:restaurantId/reviews', reviewRouter);

router.get('/within/:distance/:unit/near/:latlng', getRestaurantsWithin);
router.get('/distances-from/:latlng/unit/:unit', getDistances);

router.get('/stats-by-suburb', getStatsBySuburb);
router.get('/stats-by-cuisine', getStatsByCuisine);

router.get('/top-5-by-suburb/:suburb', top5BySuburb, advancedQuery(Restaurant), getAllRestaurants);
router.get('/top-5-by-cuisine/:cuisine', top5ByCuisine, advancedQuery(Restaurant), getAllRestaurants);

router.get('/monthly-stats/:year', protect, restrictTo('owner', 'admin'), getMonthlyStats);

router
  .route('/')
  .get(advancedQuery(Restaurant), getAllRestaurants)
  .post(protect, restrictTo('staff', 'owner', 'admin'), createRestaurant);

router
  .route('/:id')
  .get(getRestaurant)
  .patch(protect, restrictTo('staff', 'owner', 'admin'), updateRestaurant)
  .delete(protect, restrictTo('owner', 'admin'), deleteRestaurant);

module.exports = router;