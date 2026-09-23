const mongoose = require('mongoose');

const mysterySchema = new mongoose.Schema({
  researchResource: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchResource', required: true },
  title: { type: String, required: true, trim: true },
  description: String,
  difficulty: { type: String, default: 'beginner' },
  estimatedTime: String,
  clues: [{ title: String, description: String, evidenceLink: { type: mongoose.Schema.Types.ObjectId, ref: 'EvidenceLink' }, choices: [String], correctAnswer: String }],
  status: { type: String, default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.models.Mystery || mongoose.model('Mystery', mysterySchema);
