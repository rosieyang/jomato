const mongoose = require('mongoose');
const Restaurant = require('./restaurantModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    minlength: 5,
    trim: true,
    required: [true, 'Please add a review']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Review must belong to a restaurant']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  }
});

// Prevent user from writing more than one review per restaurant
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

// Calculate ratingsAverage & ratingsQuantity from review
reviewSchema.statics.calcRatings = async function (restaurant) {
  const stats = await this.aggregate([
    {
      $match: { restaurant }
    },
    {
      $group: {
        _id: '$restaurant',
        avgRating: { $avg: '$rating' },
        nRating: { $sum: 1 }
      }
    }
  ]);

  await Restaurant.findByIdAndUpdate(restaurant, {
    ratingsAverage: stats.length > 0 ? stats[0].avgRating.toFixed(2) : 0,
    ratingsQuantity: stats.length > 0 ? stats[0].nRating : 0
  });
}

// Call calcRatings after save
reviewSchema.post('save', function () {
  this.constructor.calcRatings(this.restaurant);
});

// Call calcRatings after update or delete
reviewSchema.post(/^findOneAnd/, function (doc) {
  doc.constructor.calcRatings(doc.restaurant);
});

module.exports = mongoose.model('Review', reviewSchema);