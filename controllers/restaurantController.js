const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');
const Restaurant = require('../models/restaurantModel');

// @desc        Get all restaurants
// @route       GET /api/restaurants
// @access      Public
exports.getAllRestaurants = asyncHandler(async (req, res, next) => {
  const restaurants = await Restaurant.find();

  res.status(200).json({
    status: 'success',
    count: restaurants.length,
    data: restaurants
  });
});

// @desc        Get single restaurant
// @route       GET /api/restaurants/:id
// @access      Public
exports.getRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: restaurant
  });
});

// @desc        Create new restaurant
// @route       POST /api/restaurants
// @access      Private
exports.createRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);

  res.status(201).json({
    status: 'success',
    data: restaurant
  });
});

// @desc        Update restaurant
// @route       PATCH /api/restaurants/:id
// @access      Private
exports.updateRestaurant = asyncHandler(async (req, res, next) => {
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
});

// @desc        Delete restaurant
// @route       DELETE /api/restaurants/:id
// @access      Private (only for owner & admin)
exports.deleteRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: restaurant
  });
});

// @desc        Get restaurants within distance near point
// @route       GET /api/restaurants/within/:distance/:unit/near/:latlng
// @route       ex) /api/restaurants/within/10/km/near/-33.873,151.207
// @access      Public
exports.getRestaurantsWithin = asyncHandler(async (req, res, next) => {
  const { distance, unit, latlng } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude of a point', 400));
  }

  if (unit !== 'km' && unit !== 'mi') {
    next(new AppError('Please provide unit in km(kilometres) or mi(miles)', 400));
  }
  
  const radius = (unit === 'km') ? distance / 6378.16 : distance / 3963.2;

  const restaurants = await Restaurant.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    count: restaurants.length,
    data: restaurants
  });
});

// @desc        Get distances from point to all restaurants
// @route       GET /api/restaurants/distances-from/:latlng/unit/:unit
// @route       ex) /api/restaurants/distances-from/-33.873,151.207/unit/km
// @access      Public
exports.getDistances = asyncHandler(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(new AppError('Please provide latitude and longitude of a point', 400));
  }

  if (unit !== 'km' && unit !== 'mi') {
    next(new AppError('Please provide unit in km(kilometres) or mi(miles)', 400));
  }

  const distances = await Restaurant.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: (unit === 'km') ? 0.001 : 0.000621371
      }
    },
    {
      $project: {
        name: 1,
        distance: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: distances
  });
});