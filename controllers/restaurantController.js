exports.getAllRestaurants = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: 'Get all restaurants'
  });
}

exports.getRestaurant = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: 'Get single restaurant'
  });
}

exports.createRestaurant = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: 'Create new restaurant'
  });
}

exports.updateRestaurant = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: 'Update restaurant'
  });
}

exports.deleteRestaurant = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: 'Delete restaurant'
  });
}