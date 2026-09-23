const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: String,
  region: String,
  coordinates: { latitude: Number, longitude: Number },
  description: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.models.Station || mongoose.model('Station', stationSchema);
