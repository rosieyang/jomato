const express = require('express');
const {
  getAllRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurantController');

const router = express.Router();

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