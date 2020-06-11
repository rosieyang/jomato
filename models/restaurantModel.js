const mongoose = require('mongoose');
const slugify = require('slugify');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [30, 'Name can not be longer than 30 characters']
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  website: String,
  phone: String,
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  cityCountry: String,
  cuisine: {
    type: String,
    enum: ['Modern Australian', 'Italian', 'Burger', 'Pizza', 'Sandwich', 'Cafe', 'Korean', 'Indian', 'Thai', 'Vietnamese', 'Turkish', 'Chinese', 'Malaysian', 'Japanese', 'Greek', 'Seafood'],
    required: [true, 'Please add a cuisine']
  },
  atmosphere: {
    type: String,
    enum: ['casual', 'cosy']
  },
  imageCover: String,
  images: [String],
  ratingsAverage: {
    type: Number,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    default: 1
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  delivery: {
    type: Boolean,
    default: false
  },
  takeaway: {
    type: Boolean,
    default: false
  },
  cashOnly: {
    type: Boolean,
    default: false
  },
  wheelchairAccessible: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create URL-friendly slug from the name before save a document
restaurantSchema.pre('save', async function () {
  this.slug = await slugify(this.name, { lower: true });
});

module.exports = mongoose.model('Restaurant', restaurantSchema);