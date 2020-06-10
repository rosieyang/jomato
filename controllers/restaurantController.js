const AppError = require('../utils/appError');
const Restaurant = require('../models/restaurantModel');

// @desc        Get all restaurants
// @route       GET /api/restaurants
// @access      Public
exports.getAllRestaurants = async (req, res, next) => {
  const restaurants = await Restaurant.find();

  res.status(200).json({
    status: 'success',
    count: restaurants.length,
    data: restaurants
  });
}

// @desc        Get single restaurant
// @route       GET /api/restaurants/:id
// @access      Public
exports.getRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: restaurant
  });
}

// @desc        Create new restaurant
// @route       POST /api/restaurants
// @access      Private
exports.createRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);

  res.status(201).json({
    status: 'success',
    data: restaurant
  });
}

// @desc        Update restaurant
// @route       PATCH /api/restaurants/:id
// @access      Private
exports.updateRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: restaurant
  });
}

// @desc        Delete restaurant
// @route       DELETE /api/restaurants/:id
// @access      Private (only for owner & admin)
exports.deleteRestaurant = async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: restaurant
  });
}