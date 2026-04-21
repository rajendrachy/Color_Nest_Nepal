const mongoose = require('mongoose');

const reportLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['PDF', 'CSV']
  },
  reportName: {
    type: String,
    required: true
  },
  downloadTimestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ReportLog = mongoose.model('ReportLog', reportLogSchema);

module.exports = ReportLog;
