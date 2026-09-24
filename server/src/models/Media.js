const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  description: String,
  region: String,
  url: String,
  thumbnailUrl: String,
  credit: String,
  source: String,
  sourceId: { type: String, unique: true, sparse: true, index: true },
  sourceUrl: String,
  researchResource: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchResource' },
  expedition: { type: mongoose.Schema.Types.ObjectId, ref: 'Expedition' }
}, { timestamps: true });

module.exports = mongoose.models.Media || mongoose.model('Media', mediaSchema);
