const path = require('path');
const AppError = require('../utils/appError');
const asyncHandler = require('../middleware/asyncHandler');
const Restaurant = require('../models/restaurantModel');
const User = require('../models/userModel');

// @desc        Get all restaurants
// @route       GET /api/restaurants
// @access      Public
exports.getAllRestaurants = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedQuery);
});

// @desc        Get single restaurant
// @route       GET /api/restaurants/:id
// @access      Public
exports.getRestaurant = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id).populate({
    path: 'reviews',
    select: 'review rating'
  });

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
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  restaurant.remove();

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

// @desc        Get aggregation for restaurants by suburb
// @route       GET /api/restaurants/stats-by-suburb
// @access      Public
exports.getStatsBySuburb = asyncHandler(async (req, res, next) => {
  const stats = await Restaurant.aggregate([
    {
      $group: {
        _id: { $toUpper: '$suburb' },
        numRestaurants: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' }
      }
    },
    {
      $sort: { numRestaurants: -1, numRatings: -1, avgRating: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// @desc        Get aggregation for restaurants by cuisine
// @route       GET /api/restaurants/stats-by-cuisine
// @access      Public
exports.getStatsByCuisine = asyncHandler(async (req, res, next) => {
  const stats = await Restaurant.aggregate([
    {
      $unwind: '$cuisine'
    },
    {
      $group: {
        _id: { $toUpper: '$cuisine' },
        numRestaurants: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' }
      }
    },
    {
      $sort: { numRestaurants: -1, numRatings: -1, avgRating: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// @desc        Get aggregation for restaurants by monthly activity
// @route       GET /api/restaurants/monthly-stats/:year
// @access      Private
exports.getMonthlyStats = asyncHandler(async (req, res, next) => {
  // Convert string to number
  const year = req.params.year * 1;

  const monthly = await Restaurant.aggregate([
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
        numRestaurantsCreated: { $sum: 1 },
        restaurants: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numRestaurantCreated: -1 }
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

// @desc        Get 5 high ratings restaurants by suburb
// @route       GET /api/restaurants/top-5-by-suburb/:suburb
// @access      Public
exports.top5BySuburb = (req, res, next) => {
  req.query.suburb = req.params.suburb;
  req.query.sort = '-ratingsAverage,-ratingsQuantity';
  req.query.limit = '5';
  req.query.select = 'name,cuisine,ratingsAverage,ratingsQuantity,address';

  next();
}

// @desc        Get 5 high ratings restaurants by cuisine
// @route       GET /api/restaurants/top-5-by-cuisine/:cuisine
// @access      Public
exports.top5ByCuisine = (req, res, next) => {
  req.query.cuisine = { in: req.params.cuisine }
  req.query.sort = '-ratingsAverage,-ratingsQuantity';
  req.query.limit = '5';
  req.query.select = 'name,suburb,ratingsAverage,ratingsQuantity,address';

  next();
}

// @desc        Upload cover image of restaurant
// @route       POST /api/restaurants/:id/cover-image
// @access      Private
exports.uploadCover = asyncHandler(async (req, res, next) => {
  // Create custom filename  
  file.name = `cover-${res.locals.restaurant._id}${path.parse(file.name).ext}`;

  // Move file to server
  file.mv(`${process.env.FILEUPLOAD_PATH}/restaurants/cover-images/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new AppError('Error occurred uploading a file!', 500));
    }

    // Update restaurant with new imageCover
    await Restaurant.findByIdAndUpdate(req.params.id, { imageCover: file.name });

    res.status(200).json({
      status: 'success',
      imageCover: file.name,
      message: 'Cover image has been saved successfully!'
    });
  });
});

// @desc        Upload image of restaurant
// @route       POST /api/restaurants/:id/image
// @access      Private
exports.uploadImage = asyncHandler(async (req, res, next) => {
  const imageLength = res.locals.restaurant.images.length;

  if (imageLength >= 5) {
    return next(new AppError('A restaurant can have maximum 5 images. Please delete existing images first by sending a PATCH request to a restaurant', 400));
  }

  // Create custom filename  
  file.name = `img-${res.locals.restaurant._id}-${imageLength + 1}${path.parse(file.name).ext}`;

  // Move file to server
  file.mv(`${process.env.FILEUPLOAD_PATH}/restaurants/images/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new AppError('Error occurred uploading a file!', 500));
    }

    // Update restaurant with new image
    await Restaurant.findByIdAndUpdate(req.params.id, { $push: { images: file.name } });

    res.status(200).json({
      status: 'success',
      image: file.name,
      message: 'Image has been saved successfully!'
    });
  });
});

// @desc        Upload menu image of restaurant
// @route       POST /api/restaurants/:id/menu
// @access      Private
exports.uploadMenu = asyncHandler(async (req, res, next) => {
  const menuLength = res.locals.restaurant.menu.length;

  if (menuLength >= 3) {
    return next(new AppError('A restaurant can have maximum 3 menu images. Please delete existing menu first by sending a PATCH request to a restaurant', 400));
  }

  // Create custom filename  
  file.name = `menu-${res.locals.restaurant._id}-${menuLength + 1}${path.parse(file.name).ext}`;

  // Move file to server
  file.mv(`${process.env.FILEUPLOAD_PATH}/restaurants/menus/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new AppError('Error occurred uploading a file!', 500));
    }

    // Update restaurant with new menu
    await Restaurant.findByIdAndUpdate(req.params.id, { $push: { menu: file.name } });

    res.status(200).json({
      status: 'success',
      menu: file.name,
      message: 'Menu has been saved successfully!'
    });
  });
});

// @desc        Get all staff list of a restaurant
// @route       GET /api/restaurants/:id/staff
// @access      Private
exports.getAllStaff = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id).populate({
    path: 'staff',
    select: 'name email mobile id photo'
  });

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    numStaff: restaurant.staff.length,
    staff: restaurant.staff
  });
});

// @desc        Add staff to restaurant's staff list
// @route       POST /api/restaurants/:id/staff
// @access      Private
exports.addStaff = asyncHandler(async (req, res, next) => {
  // Check if there is a staff list in req.body
  if (!req.body.staff) {
    return next(new AppError("Please provide staff's id in a 'staff' field", 400));
  }

  // Convert string to array if req.body.staff is string
  const staffList = (typeof req.body.staff === 'string') ? [req.body.staff] : req.body.staff;

  // Use 'for ... of' instead of forEach to read code in sequence with async/await
  for (const staffId of staffList) {
    // Find staff and update their role & workAtRestaurant field
    const staff = await User.findByIdAndUpdate(staffId, { role: 'staff', workAtRestaurant: req.params.id });

    if (!staff) {
      return next(new AppError(`A user with the id of '${staffId}' is not found. Make sure staff is signed up and id is correct.`, 404));
    }
  }

  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { $addToSet: { staff: req.body.staff } }, {
    new: true,
    runValidators: false
  }).select('+staff');

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    numStaff: restaurant.staff.length,
    staff: restaurant.staff
  });
});

// @desc        Remove staff from restaurant's staff list
// @route       DELETE /api/restaurants/:id/staff
// @access      Private
exports.removeStaff = asyncHandler(async (req, res, next) => {
  // Check if there is a staff list in req.body
  if (!req.body.staff) {
    return next(new AppError("Please provide staff's id in a 'staff' field", 400));
  }

  // Convert string to array if req.body.staff is string
  const staffList = (typeof req.body.staff === 'string') ? [req.body.staff] : req.body.staff;

  // Use 'for ... of' instead of forEach to read code in sequence with async/await
  for (const staffId of staffList) {
    // Find staff and change their role to 'user'
    const staff = await User.findByIdAndUpdate(staffId, { role: 'user', $unset: { workAtRestaurant: 1 } } );

    if (!staff) {
      return next(new AppError(`A user with the id of '${staffId}' is not found. Make sure staff is signed up and id is correct.`, 404));
    }
  }

  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { $pullAll: { staff: staffList } }, {
    new: true,
    runValidators: false
  }).select('+staff');

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  res.status(200).json({
    status: 'success',
    numStaff: restaurant.staff.length,
    staff: restaurant.staff
  });
});