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
  top5ByCuisine,
  uploadCover,
  uploadImage,
  uploadMenu,
  getAllStaff,
  addStaff,
  removeStaff
} = require('../controllers/restaurantController');

const Restaurant = require('../models/restaurantModel');

const reviewRouter = require('./reviewRoutes');

const router = express.Router();

const advancedQuery = require('../middleware/advancedQuery');
const { protect, restrictTo } = require('../middleware/auth');
const { preprocessImage } = require('../middleware/preprocessImage');

// Re-route to other routers
router.use('/:restaurantId/reviews', reviewRouter);

// ========== CRUD RESTAURANTS ==========

router
  .route('/')
  .get(advancedQuery(Restaurant), getAllRestaurants)
  .post(protect, restrictTo('owner', 'admin'), createRestaurant);

router
  .route('/:id')
  .get(getRestaurant)
  .patch(protect, restrictTo('staff', 'owner', 'admin'), updateRestaurant)
  .delete(protect, restrictTo('owner', 'admin'), deleteRestaurant);

// ========== SPECIAL QUERY ==========

router.get('/within/:distance/:unit/near/:latlng', getRestaurantsWithin);
router.get('/distances-from/:latlng/unit/:unit', getDistances);

router.get('/stats-by-suburb', getStatsBySuburb);
router.get('/stats-by-cuisine', getStatsByCuisine);
router.get('/monthly-stats/:year', protect, restrictTo('owner', 'admin'), getMonthlyStats);

router.get('/top-5-by-suburb/:suburb', top5BySuburb, advancedQuery(Restaurant), getAllRestaurants);
router.get('/top-5-by-cuisine/:cuisine', top5ByCuisine, advancedQuery(Restaurant), getAllRestaurants);

// ========== UPLOAD IMAGES ==========

// Access allowed only for logged in users with specific roles after this line
router.use(protect);
router.use(restrictTo('staff', 'owner', 'admin'));

router.post('/:id/cover-image', preprocessImage('cover'), uploadCover);
router.post('/:id/image', preprocessImage('image'), uploadImage);
router.post('/:id/menu', preprocessImage('menu'), uploadMenu);

// ========== MANAGE STAFF LIST ==========

router.use(restrictTo('owner', 'admin'));

router
  .route('/:id/staff')
  .get(getAllStaff)
  .post(addStaff)
  .delete(removeStaff);

module.exports = router;