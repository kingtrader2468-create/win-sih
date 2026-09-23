const Dataset = require('../models/Dataset');
const EvidenceLink = require('../models/EvidenceLink');
const Expedition = require('../models/Expedition');
const Finding = require('../models/Finding');
const Mystery = require('../models/Mystery');
const OutreachContent = require('../models/OutreachContent');
const Publication = require('../models/Publication');
const ResearchResource = require('../models/ResearchResource');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

const entities = {
  resources: { Model: ResearchResource, populate: 'relatedExpedition', searchFields: ['title', 'description', 'researchArea'] },
  expeditions: { Model: Expedition, populate: 'stations', searchFields: ['title', 'description', 'code'] },
  datasets: { Model: Dataset, populate: 'expedition station', searchFields: ['title', 'description', 'researchArea'] },
  publications: { Model: Publication, populate: 'researchResource', searchFields: ['title', 'abstract', 'journal'] },
  mysteries: { Model: Mystery, populate: 'researchResource', searchFields: ['title', 'description'] },
  outreach: { Model: OutreachContent, populate: 'researchResource user', searchFields: ['title', 'content', 'format'] }
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getEntity(name) {
  return entities[name];
}

async function getAdminDashboard(request, response) {
  const [resources, expeditions, datasets, publications, mysteries, evidenceLinks, findings, users, userActivity, outreach, recentOutreach] = await Promise.all([
    ResearchResource.countDocuments(), Expedition.countDocuments(), Dataset.countDocuments(), Publication.countDocuments(),
    Mystery.countDocuments(), EvidenceLink.countDocuments(), Finding.countDocuments(), User.countDocuments(),
    UserProgress.countDocuments({ $or: [{ xp: { $gt: 0 } }, { 'recentResearch.0': { $exists: true } }] }),
    OutreachContent.countDocuments(), OutreachContent.find().populate('researchResource', 'title').populate('user', 'name').sort({ updatedAt: -1 }).limit(5).lean()
  ]);
  response.json({
    mode: 'prototype-demo-admin',
    metrics: { resources, expeditions, datasets, publications, mysteries, evidenceLinks, findings, users, userActivity, outreach },
    recentOutreach
  });
}

async function listAdminRecords(request, response) {
  const entity = getEntity(request.params.entity);
  if (!entity) return response.status(404).json({ error: { message: 'Admin collection not found.' } });
  const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 12, 1), 50);
  const filter = {};
  if (request.query.status) filter.status = request.query.status;
  if (request.query.search) {
    const pattern = new RegExp(escapeRegex(request.query.search), 'i');
    filter.$or = entity.searchFields.map((field) => ({ [field]: pattern }));
  }
  const [items, total, statuses] = await Promise.all([
    entity.Model.find(filter).populate(entity.populate).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    entity.Model.countDocuments(filter),
    entity.Model.distinct('status')
  ]);
  response.json({ items, pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) }, statuses: statuses.filter(Boolean).sort() });
}

async function updateAdminRecordStatus(request, response) {
  const entity = getEntity(request.params.entity);
  if (!entity) return response.status(404).json({ error: { message: 'Admin collection not found.' } });
  const status = String(request.body.status || '').trim();
  if (!status) return response.status(400).json({ error: { message: 'A status is required.' } });
  const item = await entity.Model.findByIdAndUpdate(request.params.id, { status }, { new: true, runValidators: true }).lean();
  if (!item) return response.status(404).json({ error: { message: 'Admin record not found.' } });
  response.json({ item });
}

module.exports = { getAdminDashboard, listAdminRecords, updateAdminRecordStatus };
