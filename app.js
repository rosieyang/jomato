require('dotenv').config();
const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const AppError = require('./utils/appError');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const restaurantRouter = require('./routes/restaurantRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const userRouter = require('./routes/userRoutes');

// Body parser
app.use(express.json());

// ========== GLOBAL MIDDLEWARE ==========

// Logger for development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize user-supplied data to prevent MongoDB operator injection
app.use(mongoSanitize());

// ========== ROUTES ==========
app.use('/api/restaurants', restaurantRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/users', userRouter);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`🔥 Can't find route '${req.originalUrl}' on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;