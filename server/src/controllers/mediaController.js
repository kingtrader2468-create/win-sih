const Media = require('../models/Media');
const ResearchResource = require('../models/ResearchResource');
const { searchNasaMedia } = require('../services/external/nasaMediaService');
const {
  enrichRecords,
  regions: polarRegions,
  stationNames,
  stationDirectory,
  stationSearchClause,
  regionSearchClause
} = require('../services/polarClassificationService');

async function listMedia(req, res) {
  try {
    const { type, region, station, status, search } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 100);

    if (search?.trim()) {
      let items = await searchNasaMedia(search.trim(), { page, limit });
      if (type && type !== 'All') items = items.filter((item) => item.type === type);
      return res.json({
        items: enrichRecords(items),
        filters: { regions: polarRegions, stations: stationNames(), types: ['Image', 'Video', 'Audio'], statuses: ['published'] },
        count: items.length,
        pagination: { page, limit, total: null, totalPages: null, source: 'NASA Image and Video Library' },
        success: true
      });
    }
    const filter = {};

    if (type && type !== 'All') {
      filter.type = type;
    }
    if (region && region !== 'All') {
      filter.$and = [regionSearchClause('media', region)];
    }
    if (station) {
      filter.$and = [...(filter.$and || []), stationSearchClause('media', station)];
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: new RegExp(sanitized, 'i') },
        { description: new RegExp(sanitized, 'i') },
        { credit: new RegExp(sanitized, 'i') }
      ];
    }

    const [items, total] = await Promise.all([
      station ? Media.find(filter)
      .populate('researchResource', 'title region year type')
      .populate('expedition', 'title code region')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean() : Promise.resolve([]),
      station ? Media.countDocuments(filter) : Promise.resolve(0)
    ]);
    const groupedRecords = await Media.find(filter)
      .populate('researchResource', 'title description region')
      .populate('expedition', 'title region')
      .lean();
    const stationGroups = new Map(stationDirectory().map((group) => [group.station, { ...group }]));
    enrichRecords(groupedRecords).forEach((record) => {
      const group = stationGroups.get(record.category.group);
      if (group) {
        group.count += 1;
        return;
      }
      stationGroups.set(record.category.group, {
        station: record.category.group,
        region: record.category.region,
        count: 1
      });
    });

    const [regions, types, statuses] = await Promise.all([
      Media.distinct('region'),
      Media.distinct('type'),
      Media.distinct('status')
    ]);

    return res.json({
      items: enrichRecords(items),
      stationGroups: [...stationGroups.values()]
        .filter((group) => group.count > 0)
        .sort((left, right) => right.count - left.count || left.station.localeCompare(right.station)),
      filters: {
        regions: [...new Set([...regions.filter(Boolean), ...polarRegions])].sort(),
        stations: stationNames(),
        types: types.filter(Boolean).sort(),
        statuses: statuses.filter(Boolean).sort()
      },
      count: items.length,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
      success: true
    });
  } catch (error) {
    console.error('List Media Error:', error);
    return res.status(500).json({ error: { message: 'Failed to retrieve media items.' } });
  }
}

async function getMediaById(req, res) {
  try {
    const { id } = req.params;
    const item = await Media.findById(id)
      .populate('researchResource')
      .populate('expedition')
      .lean();

    if (!item) {
      return res.status(404).json({ error: { message: 'Media item not found.' } });
    }

    let related = [];
    if (item.researchResource?._id) {
      related = await ResearchResource.find({ _id: item.researchResource._id }).select('title type year region').lean();
    }

    return res.json({
      item,
      relatedResources: related,
      success: true
    });
  } catch (error) {
    console.error('Get Media Error:', error);
    return res.status(500).json({ error: { message: 'Failed to load media item.' } });
  }
}

module.exports = {
  listMedia,
  getMediaById
};
