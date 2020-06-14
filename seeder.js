require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');

// Load models
const Restaurant = require('./models/restaurantModel');
const Review = require('./models/reviewModel');
const User = require('./models/userModel');

// Connect to DB
const DB = process.env.MONGODB.replace(
  '<password>',
  process.env.MONGODB_PASSWORD
);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// Read JSON files
const restaurants = JSON.parse(fs.readFileSync(`${__dirname}/_data/restaurants.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));

// Import data into DB
const importData = async () => {
  try {
    await Restaurant.create(restaurants);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('Data imported...'.green.inverse);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

// Delete all data from DB
const deleteData = async () => {
  try {
    await Restaurant.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Data deleted...'.red.inverse);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}