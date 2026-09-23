const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  institution: {
    type: String,
    trim: true,
    default: 'Independent Researcher / Student'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['research', 'student', 'media', 'expedition', 'general'],
    default: 'general'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  ticketId: {
    type: String,
    unique: true,
    default: () => `POL-TKT-${Math.floor(100000 + Math.random() * 900000)}`
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'archived'],
    default: 'new'
  }
}, { timestamps: true });

module.exports = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);
