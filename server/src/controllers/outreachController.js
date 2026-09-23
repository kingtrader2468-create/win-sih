const mongoose = require('mongoose');
const User = require('../models/User');
const ResearchResource = require('../models/ResearchResource');
const Finding = require('../models/Finding');
const EvidenceLink = require('../models/EvidenceLink');
const OutreachContent = require('../models/OutreachContent');
const UserProgress = require('../models/UserProgress');
const geminiService = require('../services/geminiService');

const formats = ['Instagram Post', '60-sec Video Script', 'School Presentation', 'Infographic', 'Quiz'];

async function listOutreachDrafts(request, response) {
  try {
    const user = request.user || await User.findOne({ email: 'demo@polar-india-hub.local' }) || await User.findOne();
    const query = user ? { user: user._id } : {};
    const drafts = await OutreachContent.find(query)
      .populate('researchResource', 'title region year type')
      .sort({ updatedAt: -1 })
      .lean();

    return response.json({ drafts, total: drafts.length });
  } catch (error) {
    console.error('Error listing outreach drafts:', error);
    return response.status(500).json({ error: { message: 'Failed to list outreach drafts.' } });
  }
}

async function getOutreachDraftById(request, response) {
  try {
    const { id } = request.params;
    if (!mongoose.isValidObjectId(id)) {
      return response.status(400).json({ error: { message: 'Invalid outreach draft ID.' } });
    }
    const draft = await OutreachContent.findById(id)
      .populate('researchResource', 'title region year type')
      .populate('user', 'name email role')
      .lean();

    if (!draft) return response.status(404).json({ error: { message: 'Outreach draft not found.' } });
    return response.json({ draft });
  } catch (error) {
    return response.status(500).json({ error: { message: 'Failed to retrieve outreach draft.' } });
  }
}

async function updateOutreachDraft(request, response) {
  try {
    const { id } = request.params;
    if (!mongoose.isValidObjectId(id)) {
      return response.status(400).json({ error: { message: 'Invalid outreach draft ID.' } });
    }
    const { content, title, status } = request.body;
    const update = {};
    if (content !== undefined) update.content = content;
    if (title !== undefined) update.title = title;
    if (status !== undefined) update.status = status;

    const draft = await OutreachContent.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!draft) return response.status(404).json({ error: { message: 'Outreach draft not found.' } });
    return response.json({ draft, message: 'Draft updated successfully.' });
  } catch (error) {
    return response.status(500).json({ error: { message: 'Failed to update outreach draft.' } });
  }
}

async function generateOutreach(request, response) {
  const { researchResource, format, evidenceLinks = [], title } = request.body;
  if (!researchResource || !formats.includes(format)) {
    return response.status(400).json({ error: { message: 'A research resource and supported format are required.' } });
  }

  const resource = await ResearchResource.findById(researchResource).lean();
  if (!resource) return response.status(404).json({ error: { message: 'Research resource not found.' } });

  const user = request.user || await User.findOne({ email: 'demo@polar-india-hub.local' }) || await User.findOne();
  if (!user) {
    return response.status(401).json({ error: { message: 'Scholar authentication required to generate outreach content. Please sign in.' } });
  }

  const findings = await Finding.find({ researchResource: resource._id }).lean();
  const findingIds = findings.map((f) => f._id);

  const queryLinks = evidenceLinks.length > 0
    ? { _id: { $in: evidenceLinks } }
    : { finding: { $in: findingIds } };

  const validEvidence = await EvidenceLink.find(queryLinks)
    .populate('dataset observation expedition station publication media')
    .lean();

  const generated = await geminiService.generateOutreachContent({
    resource,
    findings,
    evidenceLinks: validEvidence,
    format,
    title
  });

  const record = await OutreachContent.create({
    user: user._id,
    researchResource: resource._id,
    evidenceLinks: validEvidence.map((item) => item._id),
    format,
    title: generated.title || title || `${format} — ${resource.title}`,
    content: generated.content,
    status: 'draft'
  });

  await UserProgress.findOneAndUpdate(
    { user: user._id },
    { $setOnInsert: { user: user._id }, $addToSet: { outreachCreated: record._id } },
    { upsert: true }
  );

  return response.status(201).json({
    content: record,
    sourceLabel: generated.sourceLabel || `Based on selected research/evidence: ${resource.title}`,
    evidenceUsed: generated.evidenceUsed || [],
    mode: generated.mode || 'prototype-fallback'
  });
}

module.exports = { listOutreachDrafts, getOutreachDraftById, updateOutreachDraft, generateOutreach, formats };
