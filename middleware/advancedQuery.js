module.exports = model => async (req, res, next) => {
  let query;

  // Exclude fields
  const reqQuery = { ...req.query };
  const excludedFields = ['select', 'sort', 'page', 'limit'];
  excludedFields.forEach(field => delete reqQuery[field]);

  // ========== FILTER ==========
  // ?location.city=Sydney / ?ratingsAverage[gte]=4 / ?cuisine[in]=Thai

  let queryStr = JSON.stringify(reqQuery);

  // Enable to use operators
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|ne|in)\b/g,
    match => `$${match}`);

  query = model.find(JSON.parse(queryStr));

  // ========== SELECT ==========
  // ?select=name,cuisine,suburb

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // ========== SORT ==========
  // ?sort=-ratingsAverage,-ratingsQuantity

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // ========== PAGINATION ==========
  // ?page=2&limit=10
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;
  const end = page * limit;
  const total = await model.countDocuments(JSON.parse(queryStr));

  query = query.skip(skip).limit(limit);

  const pagination = {};

  if (skip > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  if (end < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  // ========== EXECUTE QUERY ==========
  const results = await query;

  res.advancedQuery = {
    status: 'success',
    count: results.length,
    pagination,
    data: results
  }

  next();
}