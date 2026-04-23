const mongoose = require('mongoose');

const painterRequestSchema = new mongoose.Schema({
  painter: { type: mongoose.Schema.Types.ObjectId, ref: 'Painter', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  address: { type: String },
  details: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PainterRequest', painterRequestSchema);
