const EvidenceLink = require('../models/EvidenceLink');
const Finding = require('../models/Finding');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const { awardEligibleBadges } = require('../services/progressService');

const entityFields = ['dataset', 'observation', 'expedition', 'station', 'publication', 'media'];

function nodeDescription(entity) {
  return entity.description || entity.abstract || entity.note || 'No description is available.';
}

function toNode(type, entity) {
  if (!entity) return null;
  return {
    id: String(entity._id),
    type,
    title: entity.title || entity.name || 'Untitled evidence',
    source: entity.source || entity.credit || 'Prototype Demo Content',
    year: entity.year || null,
    description: nodeDescription(entity),
    relatedResearch: entity.relatedResearch ? String(entity.relatedResearch._id || entity.relatedResearch) : entity.researchResource ? String(entity.researchResource._id || entity.researchResource) : null,
    sourceUrl: entity.fileUrl || entity.url || null
  };
}

async function getEvidenceGraph(request, response) {
  const finding = await Finding.findById(request.params.findingId).populate('researchResource').lean();
  if (!finding) return response.status(404).json({ error: { message: 'Finding not found.' } });

  const links = await EvidenceLink.find({ finding: finding._id })
    .populate({ path: 'dataset', populate: { path: 'station expedition' } })
    .populate({ path: 'observation', populate: { path: 'dataset expedition station' } })
    .populate({ path: 'expedition', populate: { path: 'stations' } })
    .populate('station publication media')
    .lean();

  const findingNode = toNode('Finding', {
    ...finding,
    source: finding.researchResource?.source,
    year: finding.researchResource?.year,
    relatedResearch: finding.researchResource,
    sourceUrl: finding.researchResource?.sourceUrl || finding.researchResource?.fileUrl
  });

  const nodes = [findingNode];
  const edges = [];
  const edgeSet = new Set();

  function addEdge(sourceId, targetId, label, evidenceLinkId) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const edgeKey = `${sourceId}->${targetId}:${label}`;
    if (edgeSet.has(edgeKey)) return;
    edgeSet.add(edgeKey);
    edges.push({
      id: `edge-${sourceId}-${targetId}-${edges.length}`,
      source: String(sourceId),
      target: String(targetId),
      label,
      evidenceLinkId: evidenceLinkId ? String(evidenceLinkId) : undefined
    });
  }

  links.forEach((link) => {
    const linkNodes = {};
    entityFields.forEach((field) => {
      const entity = link[field];
      if (entity) {
        const typeName = field.charAt(0).toUpperCase() + field.slice(1);
        const node = toNode(typeName, entity);
        if (node) {
          linkNodes[field] = node;
          if (!nodes.some((item) => item.id === node.id)) {
            nodes.push(node);
          }
        }
      }
    });

    const fId = String(finding._id);

    // 1. Finding -> Dataset (supports)
    if (linkNodes.dataset) {
      addEdge(fId, linkNodes.dataset.id, link.relationship || 'supports', link._id);
    }

    // 2. Dataset -> Observation (generated) OR Finding -> Observation
    if (linkNodes.observation) {
      if (linkNodes.dataset) {
        addEdge(linkNodes.dataset.id, linkNodes.observation.id, 'generated', link._id);
      } else {
        addEdge(fId, linkNodes.observation.id, 'observed', link._id);
      }
    }

    // 3. Observation -> Expedition (belongsTo) OR Dataset -> Expedition OR Finding -> Expedition
    if (linkNodes.expedition) {
      if (linkNodes.observation) {
        addEdge(linkNodes.observation.id, linkNodes.expedition.id, 'belongsTo', link._id);
      } else if (linkNodes.dataset) {
        addEdge(linkNodes.dataset.id, linkNodes.expedition.id, 'recordedDuring', link._id);
      } else {
        addEdge(fId, linkNodes.expedition.id, 'investigatedBy', link._id);
      }
    }

    // 4. Expedition -> Station (uses) OR Observation -> Station OR Finding -> Station
    if (linkNodes.station) {
      if (linkNodes.expedition) {
        addEdge(linkNodes.expedition.id, linkNodes.station.id, 'uses', link._id);
      } else if (linkNodes.observation) {
        addEdge(linkNodes.observation.id, linkNodes.station.id, 'recordedAt', link._id);
      } else if (linkNodes.dataset) {
        addEdge(linkNodes.dataset.id, linkNodes.station.id, 'measuredAt', link._id);
      } else {
        addEdge(fId, linkNodes.station.id, 'stationContext', link._id);
      }
    }

    // 5. Finding -> Publication (appearsIn)
    if (linkNodes.publication) {
      addEdge(fId, linkNodes.publication.id, 'appearsIn', link._id);
    }

    // 6. Expedition -> Media (hasMedia) OR Finding -> Media
    if (linkNodes.media) {
      if (linkNodes.expedition) {
        addEdge(linkNodes.expedition.id, linkNodes.media.id, 'hasMedia', link._id);
      } else {
        addEdge(fId, linkNodes.media.id, 'documentedBy', link._id);
      }
    }
  });

  return response.json({ findingId: String(finding._id), nodes, edges });
}

async function markEvidenceInvestigated(request, response) {
  const finding = await Finding.findById(request.params.findingId).select('_id');
  if (!finding) return response.status(404).json({ error: { message: 'Finding not found.' } });
  const user = await User.findOne({ email: 'demo@polar-india-hub.local' });
  if (!user) return response.status(404).json({ error: { message: 'Demo student session is unavailable.' } });
  const progress = await UserProgress.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id } }, { new: true, upsert: true });
  if (!progress.evidenceInvestigations.some((item) => String(item) === String(finding._id))) progress.evidenceInvestigations.push(finding._id);
  const awardedBadges = await awardEligibleBadges(progress);
  await progress.save();
  return response.json({ xp: progress.xp, awardedBadges: awardedBadges.map((badge) => badge.name) });
}

module.exports = { getEvidenceGraph, markEvidenceInvestigated };
