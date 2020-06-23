const Restaurant = require('../models/restaurantModel');
const AppError = require('../utils/appError');

exports.preprocessImage = (img) => async (req, res, next) => {
  // Check if restaurant exists
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new AppError(`A restaurant with the id of '${req.params.id}' is not found.`, 404));
  }

  // Check if there is an uploaded file
  if (!req.files) {
    return next(new AppError('Please upload a file', 400));
  }

  // Check if an uploaded file is in a proper field
  if (img === 'cover' && !req.files.cover) {
    return next(new AppError("Please upload a file in a 'cover' field", 400));
  } else if (img === 'image' && !req.files.image) {
    return next(new AppError("Please upload a file in an 'image' field", 400));
  } else if (img === 'menu' && !req.files.menu) {
    return next(new AppError("Please upload a file in a 'menu' field", 400));
  }

  file = (img === 'cover') ? req.files.cover :
          (img === 'image') ? req.files.image :
          req.files.menu;

  // Check if the uploaded image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new AppError('Please upload an image file', 400));
  }

  // Check filesize
  if (file.size > process.env.FILEUPLOAD_MAXSIZE) {
    // Convert Bytes into Megabytes
    const maxSizeInMB = process.env.FILEUPLOAD_MAXSIZE / 1000000;

    return next(new AppError(`Please upload an image less than ${maxSizeInMB}MB`, 400));
  }

  // Save variables locally to use in next middleware
  res.locals.file = file;
  res.locals.restaurant = restaurant;

  next();
}