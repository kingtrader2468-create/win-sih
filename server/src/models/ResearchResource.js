const mongoose = require('mongoose');
const { Schema } = mongoose;

const researchResourceSchema = new Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  description: String,
  year: Number,
  region: String,
  researchArea: String,
  source: String,
  authors: [String],
  fileUrl: String,
  thumbnailUrl: String,
  relatedExpedition: { type: Schema.Types.ObjectId, ref: 'Expedition' },
  relatedDatasets: [{ type: Schema.Types.ObjectId, ref: 'Dataset' }],
  relatedPublications: [{ type: Schema.Types.ObjectId, ref: 'Publication' }],
  relatedMedia: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
  contentText: String,
  sourceUrl: String,
  documentType: String,
  verificationStatus: {
    type: String,
    enum: ['Prototype Demo Content', 'Verified Source', 'Source-linked Resource', 'verified'],
    default: 'Verified Source'
  },
  sourceOrganization: String,
  citation: String,
  lastVerifiedAt: Date,
  tags: [String],
  status: { type: String, default: 'published' }
}, { timestamps: true });

module.exports = mongoose.models.ResearchResource || mongoose.model('ResearchResource', researchResourceSchema);
