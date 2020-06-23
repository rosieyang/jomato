require('dotenv').config();
const path = require('path');
const express = require('express');
const colors = require('colors');
const helmet = require('helmet');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const errorHandler = require('./middleware/errorHandler');

const restaurantRouter = require('./routes/restaurantRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// ========== GLOBAL MIDDLEWARE ==========

// Set security HTTP headers
app.use(helmet());

// Logger for development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Limit requests from same IP (max 100 requests allowed per 10 mins)
const limiter = rateLimit({
  max: 100,
  windowMs: 10 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after 10 minutes!'
});
app.use('/api', limiter);

// Body parser
app.use(express.json());

// Sanitize user-supplied data to prevent MongoDB operator injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Enable CORS
app.use(cors());

// Protect against HTTP parameter pollution attacks
app.use(hpp({
  // Allow specific params
  whitelist: ['cuisine', 'suburb', 'ratingsAverage', 'ratingsQuantity']
}));

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