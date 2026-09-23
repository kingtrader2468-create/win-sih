const ResearchResource = require('../models/ResearchResource');
const Finding = require('../models/Finding');
const EvidenceLink = require('../models/EvidenceLink');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const { awardEligibleBadges } = require('../services/progressService');
const geminiService = require('../services/geminiService');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSort(sort) {
  if (sort === 'title') return { title: 1 };
  if (sort === 'oldest') return { year: 1, title: 1 };
  return { year: -1, createdAt: -1 };
}

async function getResearch(request, response) {
  const { search, region, type, researchArea, year, sort = 'newest' } = request.query;
  const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(request.query.limit, 10) || 6, 1), 24);
  const filter = {};

  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { title: pattern },
      { description: pattern },
      { authors: pattern },
      { researchArea: pattern },
      { region: pattern },
      { sourceOrganization: pattern },
      { tags: pattern }
    ];
  }
  if (region) filter.region = region;
  if (type) filter.type = type;
  if (researchArea) filter.researchArea = researchArea;
  if (year) filter.year = Number(year);

  const [items, total, regions, types, researchAreas, years] = await Promise.all([
    ResearchResource.find(filter).sort(getSort(sort)).skip((page - 1) * limit).limit(limit).lean(),
    ResearchResource.countDocuments(filter),
    ResearchResource.distinct('region'),
    ResearchResource.distinct('type'),
    ResearchResource.distinct('researchArea'),
    ResearchResource.distinct('year')
  ]);

  response.json({
    items,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    filters: {
      regions: regions.filter(Boolean).sort(),
      types: types.filter(Boolean).sort(),
      researchAreas: researchAreas.filter(Boolean).sort(),
      years: years.filter(Boolean).sort((a, b) => b - a)
    }
  });
}

async function getResearchById(request, response) {
  const resource = await ResearchResource.findById(request.params.id)
    .populate('relatedExpedition relatedDatasets relatedPublications relatedMedia')
    .lean();
  if (!resource) return response.status(404).json({ error: { message: 'Research resource not found.' } });

  const [findings, relatedResources] = await Promise.all([
    Finding.find({ researchResource: resource._id }).select('title description importance evidenceLinks').lean(),
    ResearchResource.find({ _id: { $ne: resource._id }, region: resource.region }).limit(3).select('title type description year region').lean()
  ]);
  return response.json({ resource, findings, relatedResources });
}

async function analyzeResearch(request, response) {
  try {
    const resource = await ResearchResource.findById(request.params.id)
      .populate('relatedExpedition relatedDatasets relatedPublications relatedMedia')
      .lean();
    if (!resource) return response.status(404).json({ error: { message: 'Research resource not found.' } });

    const [findings, relatedResources] = await Promise.all([
      Finding.find({ researchResource: resource._id }).lean(),
      ResearchResource.find({ _id: { $ne: resource._id }, region: resource.region }).limit(3).select('title type description year region').lean()
    ]);

    const findingIds = findings.map((f) => f._id);
    const evidenceLinks = await EvidenceLink.find({ finding: { $in: findingIds } })
      .populate('dataset observation expedition station publication media')
      .lean();

    const analysis = await geminiService.analyzeResource({
      resource,
      findings,
      evidenceLinks,
      relatedResources
    });

    return response.json(analysis);
  } catch (error) {
    console.error('Error in analyzeResearch:', error);
    return response.status(500).json({ error: { message: 'Failed to analyze research resource.' } });
  }
}

async function chatAboutResearch(request, response) {
  try {
    const resource = await ResearchResource.findById(request.params.id).lean();
    if (!resource) return response.status(404).json({ error: { message: 'Research resource not found.' } });

    const message = String(request.body.message || '').trim();
    if (!message) return response.status(400).json({ error: { message: 'A question is required.' } });

    const findings = await Finding.find({ researchResource: resource._id }).lean();
    const findingIds = findings.map((f) => f._id);
    const evidenceLinks = await EvidenceLink.find({ finding: { $in: findingIds } })
      .populate('dataset observation expedition station publication media')
      .lean();

    const result = await geminiService.chatAboutResource({
      resource,
      findings,
      evidenceLinks,
      message
    });

    return response.json(result);
  } catch (error) {
    console.error('Error in chatAboutResearch:', error);
    return response.status(500).json({ error: { message: 'Failed to process question.' } });
  }
}

async function markResearchExplored(request, response) {
  const resource = await ResearchResource.findById(request.params.id).select('_id');
  if (!resource) return response.status(404).json({ error: { message: 'Research resource not found.' } });
  const user = await User.findOne({ email: 'demo@polar-india-hub.local' });
  if (!user) return response.status(404).json({ error: { message: 'Demo student session is unavailable.' } });
  const progress = await UserProgress.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id } }, { new: true, upsert: true });
  if (!progress.researchExplored.some((item) => String(item) === String(resource._id))) progress.researchExplored.push(resource._id);
  progress.recentResearch = progress.recentResearch.filter((item) => String(item.resource) !== String(resource._id));
  progress.recentResearch.unshift({ resource: resource._id, viewedAt: new Date() });
  progress.recentResearch = progress.recentResearch.slice(0, 8);
  const awardedBadges = await awardEligibleBadges(progress);
  await progress.save();
  return response.json({ xp: progress.xp, awardedBadges: awardedBadges.map((badge) => badge.name) });
}

module.exports = { getResearch, getResearchById, analyzeResearch, chatAboutResearch, markResearchExplored };
