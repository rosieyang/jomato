require('dotenv').config();
const express = require('express');
const colors = require('colors');
const morgan = require('morgan');

const app = express();

const restaurantRouter = require('./routes/restaurantRoutes');

// ========== GLOBAL MIDDLEWARE ==========
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ========== ROUTES ==========
app.use('/api/restaurants', restaurantRouter);

module.exports = app;