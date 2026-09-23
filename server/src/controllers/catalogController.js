const Expedition = require('../models/Expedition');
const Dataset = require('../models/Dataset');
const Publication = require('../models/Publication');
const Media = require('../models/Media');
const Station = require('../models/Station');
const ResearchResource = require('../models/ResearchResource');

const configs = {
  expeditions: { Model: Expedition, populate: 'stations' },
  datasets: { Model: Dataset, populate: 'expedition station' },
  publications: { Model: Publication, populate: 'researchResource' },
  media: { Model: Media, populate: 'researchResource expedition' },
  stations: { Model: Station, populate: '' }
};

async function listCatalog(request, response) {
  const config = configs[request.params.collection];
  if (!config) return response.status(404).json({ error: { message: 'Catalog not found.' } });
  const { search, region, type, status } = request.query;
  const filter = {};
  if (region) filter.region = region;
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (search) filter.$or = [{ title: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }, { description: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }];
  const items = await config.Model.find(filter).populate(config.populate).sort({ createdAt: -1 }).lean();
  const [regions, types, statuses] = await Promise.all([config.Model.distinct('region'), config.Model.distinct('type'), config.Model.distinct('status')]);
  return response.json({ items, filters: { regions: regions.filter(Boolean).sort(), types: types.filter(Boolean).sort(), statuses: statuses.filter(Boolean).sort() } });
}

async function getCatalogItem(request, response) {
  const config = configs[request.params.collection];
  if (!config) return response.status(404).json({ error: { message: 'Catalog not found.' } });
  const item = await config.Model.findById(request.params.id).populate(config.populate).lean();
  if (!item) return response.status(404).json({ error: { message: 'Catalog item not found.' } });
  let related = [];
  if (request.params.collection === 'expeditions') related = await ResearchResource.find({ relatedExpedition: item._id }).select('title type year region').lean();
  if (request.params.collection === 'datasets') related = await ResearchResource.find({ relatedDatasets: item._id }).select('title type year region').lean();
  if (request.params.collection === 'publications') related = await ResearchResource.find({ relatedPublications: item._id }).select('title type year region').lean();
  if (request.params.collection === 'media') related = await ResearchResource.find({ relatedMedia: item._id }).select('title type year region').lean();
  if (request.params.collection === 'stations') related = await ResearchResource.find({ region: item.region }).select('title type year region').lean();
  return response.json({ item, relatedResources: related });
}

module.exports = { listCatalog, getCatalogItem };
