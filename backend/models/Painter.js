const mongoose = require('mongoose');

const painterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  specialties: [{
    type: String
  }],
  bio: {
    type: String
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&h=150&fit=crop'
  },
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Painter', painterSchema);
