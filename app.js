require('dotenv').config();
const express = require('express');
const colors = require('colors');

const app = express();

const restaurantRouter = require('./routes/restaurantRoutes');

// ========== ROUTES ==========
app.use('/api/restaurants', restaurantRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}!`.bgYellow.black.bold);
});