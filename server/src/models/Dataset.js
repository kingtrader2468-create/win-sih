const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  region: String,
  researchArea: String,
  variables: [String],
  timeRange: { start: Date, end: Date },
  fileUrl: String,
  license: String,
  dataFormat: { type: String, default: 'NetCDF-4 (.nc)' },
  cfConvention: { type: String, default: 'CF Metadata Conventions 1.8' },
  spatialProjection: { type: String, default: 'WGS 84 / Polar Stereographic' },
  calibrationStandard: { type: String, default: 'TEOS-10 Pressure Calibrated' },
  doi: String,
  expedition: { type: mongoose.Schema.Types.ObjectId, ref: 'Expedition' },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
  status: { type: String, default: 'published' }
}, { timestamps: true });

module.exports = mongoose.models.Dataset || mongoose.model('Dataset', datasetSchema);
