const mongoose = require('mongoose');

const evidenceLinkSchema = new mongoose.Schema({
  finding: { type: mongoose.Schema.Types.ObjectId, ref: 'Finding', required: true },
  dataset: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  observation: { type: mongoose.Schema.Types.ObjectId, ref: 'Observation' },
  expedition: { type: mongoose.Schema.Types.ObjectId, ref: 'Expedition' },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
  publication: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication' },
  media: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
  relationship: String,
  note: String
}, { timestamps: true });

module.exports = mongoose.models.EvidenceLink || mongoose.model('EvidenceLink', evidenceLinkSchema);
