const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String,
  icon: String,
  criteria: String,
  category: String
}, { timestamps: true });

module.exports = mongoose.models.Badge || mongoose.model('Badge', badgeSchema);
