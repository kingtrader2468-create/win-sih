const mongoose = require('mongoose');

const outreachContentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  researchResource: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchResource' },
  evidenceLinks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EvidenceLink' }],
  format: { type: String, required: true },
  title: String,
  content: String,
  status: { type: String, default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.models.OutreachContent || mongoose.model('OutreachContent', outreachContentSchema);
