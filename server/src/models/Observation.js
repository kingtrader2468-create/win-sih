const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  observedAt: Date,
  value: mongoose.Schema.Types.Mixed,
  unit: String,
  dataset: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  expedition: { type: mongoose.Schema.Types.ObjectId, ref: 'Expedition' },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' }
}, { timestamps: true });

module.exports = mongoose.models.Observation || mongoose.model('Observation', observationSchema);
