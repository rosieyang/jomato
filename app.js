require('dotenv').config();
const express = require('express');
const colors = require('colors');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const restaurantRouter = require('./routes/restaurantRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// Body parser
app.use(express.json());

// ========== GLOBAL MIDDLEWARE ==========

// Logger for development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ========== ROUTES ==========
app.use('/api/restaurants', restaurantRouter);
app.use('/api/reviews', reviewRouter);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`🔥 Can't find route '${req.originalUrl}' on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;