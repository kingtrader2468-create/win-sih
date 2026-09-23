const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, default: 'student' },
  registryId: { type: String, default: 'POL-2026-8842' },
  institution: { type: String, default: 'Gossner College Ranchi' },
  avatarUrl: String,
  googleId: { type: String, sparse: true, index: true },
  passwordHash: String
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
