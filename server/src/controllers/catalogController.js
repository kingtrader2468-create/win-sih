const Expedition = require('../models/Expedition');
const Dataset = require('../models/Dataset');
const Publication = require('../models/Publication');
const Media = require('../models/Media');
const Station = require('../models/Station');
const ResearchResource = require('../models/ResearchResource');
const {
  enrichRecords,
  regions: polarRegions,
  stationNames,
  stationDirectory,
  stationSearchClause,
  regionSearchClause
} = require('../services/polarClassificationService');

const configs = {
  expeditions: { Model: Expedition, populate: 'stations' },
  datasets: { Model: Dataset, populate: 'expedition station' },
  publications: { Model: Publication, populate: 'researchResource' },
  media: { Model: Media, populate: 'researchResource expedition' },
  stations: { Model: Station, populate: '' }
};

const fallbackExpeditions = [
  {
    _id: '000000000000000000000043',
    title: '43rd Indian Scientific Expedition to Antarctica (ISEA-43)',
    code: 'ISEA-43',
    region: 'Antarctica',
    description: 'Indian Antarctic field programme covering ice-shelf stability, oceanographic observations, biological sampling, and station operations around Prydz Bay and Larsemann Hills.',
    status: 'completed'
  },
  {
    _id: '000000000000000000000024',
    title: 'Indian Arctic Winter Expedition & IndARC Mooring Campaign',
    code: 'INDARC-24',
    region: 'Arctic',
    description: 'Indian Arctic observation campaign supporting hydrographic, meteorological, and oceanographic measurements in the Kongsfjorden and Svalbard region.',
    status: 'completed'
  },
  {
    _id: '000000000000000000000001',
    title: 'MoES Himalayan Cryosphere & Chandra Basin Campaign',
    code: 'HIMANSH-CHANDRA',
    region: 'Himalaya',
    description: 'Himalayan cryosphere field campaign covering glacier mass balance, snow-pit isotope profiling, and automated weather-station observations across the Chandra Basin.',
    status: 'completed'
  }
];

async function listCatalog(request, response) {
  const config = configs[request.params.collection];
  if (!config) return response.status(404).json({ error: { message: 'Catalog not found.' } });
  const { search, region, station, type, status, journal, source } = request.query;
  const year = Number.parseInt(request.query.year, 10);
  const filter = {};
  const polarPattern = /antarct|arctic|polar|cryosphere|glacier|glaciolog|sea ice|ice sheet|ice shelf|ice core|permafrost|snowpack|himalay|greenland|svalbard|albedo|frost|subantarctic|north pole|south pole/i;
  if (request.params.collection === 'publications') {
    filter.$or = [
      { title: polarPattern },
      { abstract: polarPattern },
      { authors: polarPattern },
      { journal: polarPattern },
      { source: polarPattern }
    ];
  }
  if (region) filter.$and = [...(filter.$and || []), regionSearchClause(request.params.collection, region)];
  if (station) {
    filter.$and = [...(filter.$and || []), stationSearchClause(request.params.collection, station)];
  }
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (Number.isFinite(year)) filter.year = year;
  if (journal) filter.journal = journal;
  if (source) filter.source = source;
  if (search) {
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const searchClause = { $or: [{ title: pattern }, { description: pattern }, { abstract: pattern }, { authors: pattern }, { doi: pattern }, { journal: pattern }, { source: pattern }] };
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, searchClause];
      delete filter.$or;
    } else {
      Object.assign(filter, searchClause);
    }
  }
  const stationFirst = ['datasets', 'publications', 'media'].includes(request.params.collection);
  let items = stationFirst && !station
    ? []
    : await config.Model.find(filter).populate(config.populate).sort({ createdAt: -1 }).lean();
  if (request.params.collection === 'expeditions' && !items.length) {
    items = fallbackExpeditions.filter((item) => {
      if (region && item.region.toLowerCase() !== region.toLowerCase()) return false;
      if (status && item.status !== status) return false;
      if (!search) return true;
      return `${item.title} ${item.code} ${item.region} ${item.description}`.toLowerCase().includes(search.toLowerCase());
    });
  }
  let groupedRecords = await config.Model.find(filter).populate(config.populate).select('title description abstract researchArea region source credit authors journal').lean();
  if (request.params.collection === 'expeditions' && !groupedRecords.length) {
    groupedRecords = fallbackExpeditions;
  }
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
  const [regionValues, types, statuses, years, journals, sources] = await Promise.all([
    config.Model.distinct('region'), config.Model.distinct('type'), config.Model.distinct('status'),
    config.Model.distinct('year'), config.Model.distinct('journal'), config.Model.distinct('source')
  ]);
  return response.json({ items: enrichRecords(items), stationGroups: [...stationGroups.values()]
    .filter((group) => group.count > 0)
    .sort((left, right) => right.count - left.count || left.station.localeCompare(right.station)), filters: {
    regions: [...new Set([...regionValues.filter(Boolean), ...polarRegions])].sort(),
    stations: stationNames(),
    types: types.filter(Boolean).sort(), statuses: statuses.filter(Boolean).sort(),
    years: years.filter(Boolean).sort((left, right) => right - left), journals: journals.filter(Boolean).sort(), sources: sources.filter(Boolean).sort()
  } });
}

async function getCatalogItem(request, response) {
  const config = configs[request.params.collection];
  if (!config) return response.status(404).json({ error: { message: 'Catalog not found.' } });
  if (request.params.collection === 'expeditions') {
    const fallback = fallbackExpeditions.find((item) => item._id === request.params.id);
    if (fallback) return response.json({ item: fallback, relatedResources: [] });
  }
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
