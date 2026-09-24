const OVERPASS_ENDPOINT = process.env.OVERPASS_ENDPOINT || 'https://overpass-api.de/api/interpreter';
let stationCache = null;
let refreshPromise = null;

const REGION_BOUNDS = {
  Antarctica: '[-90,-180,-60,180]',
  Arctic: '[-90,-180,90,180]',
  Himalaya: '[26,70,36,100]'
};

function classifyRegion(latitude, longitude) {
  if (latitude <= -60) return 'Antarctica';
  if (latitude >= 60 && longitude >= -75 && longitude <= -10) return 'Greenland';
  if (latitude >= 60) return 'Arctic';
  if (latitude >= 26 && latitude <= 36 && longitude >= 70 && longitude <= 100) return 'Himalaya';
  return null;
}

function elementCoordinates(element) {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { latitude: element.lat, longitude: element.lon };
  }
  if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') {
    return { latitude: element.center.lat, longitude: element.center.lon };
  }
  return null;
}

function normalizeElement(element) {
  const coordinates = elementCoordinates(element);
  if (!coordinates) return null;

  const region = classifyRegion(coordinates.latitude, coordinates.longitude);
  if (!region) return null;

  const tags = element.tags || {};
  const name = tags.name || tags['name:en'];
  if (!name) return null;

  const sourceId = `osm-${element.type}-${element.id}`;
  return {
    code: sourceId.toUpperCase(),
    externalId: sourceId,
    name,
    region,
    subRegion: tags['addr:state'] || tags['is_in'] || tags.description || 'Polar research facility',
    coordinates,
    status: tags.disused === 'yes' ? 'Historic / inactive' : 'Operational status not provided',
    description: tags.description || 'Scientific or research facility listed in OpenStreetMap.',
    instruments: [],
    currentWeather: null,
    telemetryHistory: [],
    source: 'OpenStreetMap',
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    verificationStatus: 'Source metadata; operational status requires verification',
    lastUpdated: new Date().toISOString()
  };
}

function buildQuery() {
  return `
[out:json][timeout:25];
(
  node["man_made"="research_station"](-90,-180,90,180);
  way["man_made"="research_station"](-90,-180,90,180);
  relation["man_made"="research_station"](-90,-180,90,180);
  node["amenity"="research_institute"](-90,-180,90,180);
  way["amenity"="research_institute"](-90,-180,90,180);
  relation["amenity"="research_institute"](-90,-180,90,180);
  node["scientific"="research_station"](-90,-180,90,180);
  way["scientific"="research_station"](-90,-180,90,180);
  relation["scientific"="research_station"](-90,-180,90,180);
);
out center tags;
`;
}

async function fetchGlobalPolarStations({ signal } = {}) {
  if (stationCache) return stationCache;
  if (refreshPromise) return [];

  refreshPromise = refreshGlobalPolarStations({ signal })
    .catch((error) => {
      console.warn('Background global station refresh unavailable:', error.message);
      return [];
    })
    .finally(() => {
      refreshPromise = null;
    });
  return [];
}

async function refreshGlobalPolarStations({ signal } = {}) {
  const response = await fetch(OVERPASS_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({ data: buildQuery() }),
    signal
  });

  if (!response.ok) {
    throw new Error(`Global station catalogue request failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  const stations = (payload.elements || [])
    .map(normalizeElement)
    .filter(Boolean);

  stationCache = [...new Map(stations.map((station) => [station.externalId, station])).values()];
  return stationCache;
}

module.exports = {
  fetchGlobalPolarStations,
  classifyRegion
};
