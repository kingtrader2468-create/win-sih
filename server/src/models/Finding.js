const mongoose = require('mongoose');

const findingSchema = new mongoose.Schema({
  researchResource: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchResource', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  importance: { type: String, default: 'medium' },
  evidenceLinks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EvidenceLink' }]
}, { timestamps: true });

module.exports = mongoose.models.Finding || mongoose.model('Finding', findingSchema);
