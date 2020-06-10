const Restaurant = require('../models/restaurantModel');

// == Description ===== Get all restaurants
// == Route =========== GET /api/restaurants
// == Access ========== Public
exports.getAllRestaurants = async (req, res, next) => {
  const restaurants = await Restaurant.find();

  res.status(200).json({
    status: 'success',
    count: restaurants.length,
    data: restaurants
  });
}

// == Description ===== Get single restaurant
// == Route =========== GET /api/restaurants/:id
// == Access ========== Public
exports.getRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    res.status(404).json({
      status: 'fail',
      message: `A restaurant with the id of '${req.params.id}' is not found.`
    });
  }

  res.status(200).json({
    status: 'success',
    data: restaurant
  });
}

// == Description ===== Create new restaurant
// == Route =========== POST /api/restaurants
// == Access ========== Private
exports.createRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);

  res.status(201).json({
    status: 'success',
    data: restaurant
  });
}

// == Description ===== Update restaurant
// == Route =========== PATCH /api/restaurants/:id
// == Access ========== Private
exports.updateRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!restaurant) {
    res.status(404).json({
      status: 'fail',
      message: `A restaurant with the id of '${req.params.id}' is not found.`
    });
  }

  res.status(200).json({
    status: 'success',
    data: restaurant
  });
}

// == Description ===== Delete restaurant
// == Route =========== DELETE /api/restaurants/:id
// == Access ========== Private (only for owner & admin)
exports.deleteRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

  if (!restaurant) {
    res.status(404).json({
      status: 'fail',
      message: `A restaurant with the id of '${req.params.id}' is not found.`
    });
  }

  res.status(200).json({
    status: 'success',
    data: `A restaurant with the id of '${req.params.id}' has been deleted.`
  });
}