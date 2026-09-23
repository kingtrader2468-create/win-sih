const Media = require('../models/Media');
const ResearchResource = require('../models/ResearchResource');

async function listMedia(req, res) {
  try {
    const { type, region, status, search } = req.query;
    const filter = {};

    if (type && type !== 'All') {
      filter.type = type;
    }
    if (region && region !== 'All') {
      filter.region = region;
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

    const items = await Media.find(filter)
      .populate('researchResource', 'title region year type')
      .populate('expedition', 'title code region')
      .sort({ createdAt: -1 })
      .lean();

    const [regions, types, statuses] = await Promise.all([
      Media.distinct('region'),
      Media.distinct('type'),
      Media.distinct('status')
    ]);

    return res.json({
      items,
      filters: {
        regions: regions.filter(Boolean).sort(),
        types: types.filter(Boolean).sort(),
        statuses: statuses.filter(Boolean).sort()
      },
      count: items.length,
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
