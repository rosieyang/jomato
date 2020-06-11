const express = require('express');
const {
  getAllRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsWithin
} = require('../controllers/restaurantController');

const router = express.Router();

router.get('/within/:distance/:unit/near/:latlng', getRestaurantsWithin);

router
  .route('/')
  .get(getAllRestaurants)
  .post(createRestaurant);

router
  .route('/:id')
  .get(getRestaurant)
  .patch(updateRestaurant)
  .delete(deleteRestaurant);

module.exports = router;