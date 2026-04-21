const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    paint: { type: mongoose.Schema.Types.ObjectId, ref: 'Paint', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  vat: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash on Delivery', 'eSewa', 'Khalti', 'ConnectIPS', 'Simulated Test Pay'],
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending' 
  },
  orderStatus: {
    type: String,
    enum: ['payment_pending', 'pending', 'approved', 'processing', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    province: String,
    district: String,
    municipality: String,
    ward: Number,
    street: String,
    coordinates: {
      type: { lat: Number, lng: Number },
      default: {}
    }
  },
  deliveryPartner: {
    name: String,
    phone: String,
    trackingNumber: String
  },
  warehouse: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  orderDate: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],
  cancellationReason: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
