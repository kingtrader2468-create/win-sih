const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['telemetry', 'expedition', 'badge', 'research', 'mystery', 'system'],
    default: 'system'
  },
  link: {
    type: String,
    default: '/'
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
