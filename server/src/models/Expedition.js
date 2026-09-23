const mongoose = require('mongoose');

const expeditionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: String,
  region: String,
  description: String,
  startDate: Date,
  endDate: Date,
  status: { type: String, default: 'completed' },
  stations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Station' }]
}, { timestamps: true });

module.exports = mongoose.models.Expedition || mongoose.model('Expedition', expeditionSchema);
