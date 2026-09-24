const globalStationCatalog = require('./external/globalStationCatalog');

const knownStations = [
  ...globalStationCatalog.map((station) => ({ name: station.name, region: station.region })),
  { name: 'Bharati Station', region: 'Antarctica' },
  { name: 'Maitri Station', region: 'Antarctica' },
  { name: 'Dakshin Gangotri', region: 'Antarctica' },
  { name: 'Himadri Station', region: 'Arctic' },
  { name: 'IndARC Underwater Mooring', region: 'Arctic' }
];

const regions = ['Antarctica', 'Arctic', 'Greenland', 'Himalaya'];
const genericStation = 'Multi-station / regional study';
const themePatterns = [
  ['Climate & Atmosphere', /climate|atmosphere|weather|aerosol|ozone|carbon|warming|meteorolog/i],
  ['Ice, Glaciers & Snow', /ice|glacier|cryosphere|snow|iceberg|permafrost|firn|sheet|shelf/i],
  ['Oceans & Sea Ice', /ocean|marine|sea ice|fjord|water|coast|algae|plankton/i],
  ['Ecology & Biology', /ecolog|biodiversity|wildlife|penguin|seal|bird|plant|microb|biology/i],
  ['Geophysics & Geology', /geolog|seismic|earthquake|magnet|gravity|tectonic|geophys/i],
  ['Remote Sensing & Earth Observation', /remote sensing|satellite|landsat|radar|lidar|imagery|observation/i],
  ['People, Policy & Polar Systems', /policy|community|human|social|governance|treaty|indigenous|econom/i]
];

function textFor(record) {
  return [
    record.title,
    record.description,
    record.abstract,
    record.researchArea,
    record.journal,
    record.source,
    record.credit,
    ...(record.authors || []),
    record.station?.name,
    record.expedition?.title,
    record.researchResource?.title,
    record.researchResource?.description
  ].filter(Boolean).join(' ');
}

function classifyRecord(record) {
  const text = textFor(record);
  const station = knownStations.find((candidate) =>
    text.toLocaleLowerCase().includes(candidate.name.toLocaleLowerCase())
  );
  const storedRegion = record.region || record.researchResource?.region;
  const region = (storedRegion && storedRegion !== 'Polar Regions' ? storedRegion : null) || station?.region ||
    regions.find((candidate) => new RegExp(candidate, 'i').test(text)) || 'Polar Regions';
  const theme = themePatterns.find(([, pattern]) => pattern.test(text))?.[0];
  const group = region !== 'Polar Regions'
    ? region
    : theme || record.researchArea || record.journal || record.source || 'Polar Regions';

  return {
    region,
    group,
    station: station?.name || genericStation
  };
}

function enrichRecords(records) {
  return records.map((record) => ({
    ...record,
    category: classifyRecord(record)
  }));
}

function stationNames() {
  return [...new Set([...regions, ...knownStations.map((station) => station.name), genericStation])].sort();
}

function stationDirectory() {
  return regions.map((region) => ({ station: region, region, count: 0 }));
}

function stationSearchClause(collection, station) {
  if (regions.includes(station)) return regionSearchClause(collection, station);
  const theme = themePatterns.find(([name]) => name === station);
  if (theme) {
    const fields = ['title', 'description', 'abstract', 'researchArea', 'journal', 'source', 'credit', 'authors', 'tags', 'sourceOrganization'];
    return {
      $or: fields.map((field) => ({ [field]: theme[1] }))
    };
  }
  if (station === genericStation) {
    const stationPatterns = knownStations.map((candidate) => new RegExp(candidate.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
    const fields = ['title', 'description', 'abstract', 'researchArea', 'journal', 'source', 'credit', 'authors', 'tags', 'sourceOrganization'];
    return { $nor: fields.flatMap((field) => stationPatterns.map((pattern) => ({ [field]: pattern }))) };
  }
  const escaped = station.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped, 'i');
  const fields = {
    research: ['title', 'description', 'abstract', 'researchArea', 'tags'],
    publications: ['title', 'abstract', 'authors', 'journal', 'source'],
    datasets: ['title', 'description', 'researchArea'],
    media: ['title', 'description', 'credit', 'source']
  }[collection] || ['title', 'description'];

  return { $or: fields.map((field) => ({ [field]: pattern })) };
}

function regionSearchClause(collection, region) {
  const escaped = region.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escaped, 'i');
  const fields = {
    research: ['title', 'description', 'abstract', 'researchArea', 'tags'],
    publications: ['title', 'abstract', 'authors', 'journal', 'source'],
    datasets: ['title', 'description', 'researchArea'],
    media: ['title', 'description', 'credit', 'source']
  }[collection] || ['title', 'description'];
  return { $or: [{ region }, ...fields.map((field) => ({ [field]: pattern }))] };
}

module.exports = {
  classifyRecord,
  enrichRecords,
  regions,
  stationNames,
  stationDirectory,
  stationSearchClause,
  regionSearchClause
};
