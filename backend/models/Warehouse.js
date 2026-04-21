const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  address: String,
  coordinates: {
    type: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    default: {}
  },
  deliveryZones: [{
    province: String,
    districts: [String],
    deliveryCharge: Number,
    estimatedDays: Number
  }],
  manager: String,
  contact: String
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
