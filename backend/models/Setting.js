const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'ColorNest Nepal' },
  contactEmail: { type: String, default: 'support@colornest.com.np' },
  vatRate: { type: Number, default: 0.13 },
  deliveryCharge: { type: Number, default: 150 },
  lowStockThreshold: { type: Number, default: 10 },
  emailNotifications: { type: Boolean, default: true },
  lowStockAlerts: { type: Boolean, default: true },
  currency: { type: String, default: 'NPR' },
  maintenanceMode: { type: Boolean, default: false },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  // Security Section
  twoFactorAuth: { type: Boolean, default: false },
  sessionTimeout: { type: Number, default: 60 }, // minutes
  passwordExpiry: { type: Number, default: 90 }, // days
  allowedLoginAttempts: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
