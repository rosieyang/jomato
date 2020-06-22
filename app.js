require('dotenv').config();
const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');

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

// Limit requests from same IP (max 100 requests allowed per 10 mins)
const limiter = rateLimit({
  max: 100,
  windowMs: 10 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after 10 minutes!'
});
app.use('/api', limiter);

// Sanitize user-supplied data to prevent MongoDB operator injection
app.use(mongoSanitize());

// Set security HTTP headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

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