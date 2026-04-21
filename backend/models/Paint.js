const mongoose = require('mongoose');

const paintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Interior', 'Exterior', 'Wood', 'Metal', 'Texture', 'Waterproofing']
  },
  subCategory: String,
  colorCode: String,
  colorName: String,
  pricePerLiter: { type: Number, required: true },
  costPricePerLiter: { type: Number, default: 0 },
  discountPrice: Number,
  availableQuantity: { type: Number, default: 0 },
  description: String,
  specifications: {
    finish: { type: String, enum: ['Matte', 'Gloss', 'Satin', 'Semi-Gloss'] },
    coverage: String,
    dryingTime: String,
    applicationMethod: String,
    durability: String
  },
  images: [String],
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Paint', paintSchema);
