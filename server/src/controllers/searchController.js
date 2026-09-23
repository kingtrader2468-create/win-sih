const ResearchResource = require('../models/ResearchResource');
const Dataset = require('../models/Dataset');
const Expedition = require('../models/Expedition');
const Publication = require('../models/Publication');
const Media = require('../models/Media');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function globalSearch(request, response) {
  const query = String(request.query.q || '').trim();
  if (!query) {
    return response.json({
      query: '',
      total: 0,
      results: [],
      research: [],
      datasets: [],
      expeditions: [],
      publications: [],
      media: []
    });
  }

  const pattern = new RegExp(escapeRegex(query), 'i');

  try {
    const [researchList, datasetList, expeditionList, publicationList, mediaList] = await Promise.all([
      ResearchResource.find({
        $or: [
          { title: pattern },
          { description: pattern },
          { region: pattern },
          { researchArea: pattern },
          { authors: pattern }
        ]
      }).limit(10).lean(),

      Dataset.find({
        $or: [
          { title: pattern },
          { description: pattern },
          { region: pattern },
          { researchArea: pattern }
        ]
      }).limit(10).lean(),

      Expedition.find({
        $or: [
          { title: pattern },
          { code: pattern },
          { region: pattern },
          { description: pattern }
        ]
      }).limit(10).lean(),

      Publication.find({
        $or: [
          { title: pattern },
          { abstract: pattern },
          { authors: pattern },
          { journal: pattern }
        ]
      }).limit(10).lean(),

      Media.find({
        $or: [
          { title: pattern },
          { description: pattern },
          { credit: pattern }
        ]
      }).limit(10).lean()
    ]);

    const formattedResearch = researchList.map((item) => ({
      id: String(item._id),
      _id: item._id,
      type: 'Research',
      title: item.title,
      description: item.description,
      region: item.region,
      researchArea: item.researchArea,
      year: item.year,
      url: `/research/${item._id}`,
      source: item.source || item.sourceOrganization || 'Polar India Hub'
    }));

    const formattedDatasets = datasetList.map((item) => ({
      id: String(item._id),
      _id: item._id,
      type: 'Dataset',
      title: item.title,
      description: item.description,
      region: item.region,
      researchArea: item.researchArea,
      year: item.timeRange?.start ? new Date(item.timeRange.start).getFullYear() : null,
      url: `/datasets/${item._id}`,
      source: 'National Polar Data Centre'
    }));

    const formattedExpeditions = expeditionList.map((item) => ({
      id: String(item._id),
      _id: item._id,
      type: 'Expedition',
      title: item.title,
      description: item.description,
      region: item.region,
      code: item.code,
      year: item.startDate ? new Date(item.startDate).getFullYear() : null,
      url: `/expeditions/${item._id}`,
      source: 'MoES / NCPOR'
    }));

    const formattedPublications = publicationList.map((item) => ({
      id: String(item._id),
      _id: item._id,
      type: 'Publication',
      title: item.title,
      description: item.abstract,
      region: 'Polar Science',
      year: item.year,
      url: item.researchResource ? `/research/${item.researchResource}` : `/publications/${item._id}`,
      source: item.journal || 'Academic Literature'
    }));

    const formattedMedia = mediaList.map((item) => ({
      id: String(item._id),
      _id: item._id,
      type: 'Media',
      title: item.title,
      description: item.description,
      region: 'Field Archive',
      year: null,
      url: `/media`,
      source: item.credit || 'Polar Media Archive'
    }));

    const results = [
      ...formattedResearch,
      ...formattedDatasets,
      ...formattedExpeditions,
      ...formattedPublications,
      ...formattedMedia
    ];

    return response.json({
      query,
      total: results.length,
      results,
      research: formattedResearch,
      datasets: formattedDatasets,
      expeditions: formattedExpeditions,
      publications: formattedPublications,
      media: formattedMedia
    });
  } catch (error) {
    console.error('Error during global search:', error);
    return response.status(500).json({ error: { message: 'Search failed.' } });
  }
}

module.exports = { globalSearch };
