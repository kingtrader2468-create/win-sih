const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  authors: [String],
  year: Number,
  abstract: String,
  doi: String,
  journal: String,
  url: String,
  source: String,
  sourceId: { type: String, unique: true, sparse: true, index: true },
  sourceUrl: String,
  status: { type: String, default: 'published' },
  researchResource: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchResource' }
}, { timestamps: true });

module.exports = mongoose.models.Publication || mongoose.model('Publication', publicationSchema);
