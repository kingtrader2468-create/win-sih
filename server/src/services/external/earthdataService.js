/**
 * Optional NASA Earthdata / CMR Adapter
 * Provides search and metadata ingestion capabilities for polar cryospheric datasets.
 * Controlled by EXTERNAL_DATA_ENABLED in server environment.
 */

const CMR_BASE_URL = process.env.NASA_CMR_BASE_URL || 'https://cmr.earthdata.nasa.gov/search';

async function fetchEarthdataCollections({ keyword = 'cryosphere', limit = 25 } = {}) {
  const token = process.env.NASA_EARTHDATA_TOKEN;
  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${CMR_BASE_URL}/collections.json?keyword=${encodeURIComponent(keyword)}&page_size=${limit}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`CMR returned status ${response.status}`);
  const data = await response.json();
  return data.feed?.entry || [];
}

function normalizeCollection(entry) {
  const landingUrl = entry.links?.find((link) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#')?.href
    || `https://cmr.earthdata.nasa.gov/search/concepts/${entry.id}.json`;
  return {
    title: entry.title || entry.id,
    description: entry.summary || entry.description || 'NASA Earthdata collection metadata.',
    region: 'Polar Regions',
    researchArea: 'Earth Observation',
    variables: (entry.archive_center ? [entry.archive_center] : []).concat(entry.processing_level ? [entry.processing_level] : []),
    fileUrl: landingUrl,
    license: 'NASA Earthdata terms of use',
    dataFormat: 'NASA Earthdata collection',
    externalId: entry.id,
    source: 'NASA Earthdata CMR',
    sourceUrl: landingUrl,
    verificationStatus: 'Verified Source',
    status: 'published'
  };
}

async function syncEarthdataCollections(Dataset, options = {}) {
  const entries = await fetchEarthdataCollections({
    keyword: options.keyword || process.env.NASA_CMR_KEYWORD || 'polar cryosphere Antarctica Arctic',
    limit: options.limit || process.env.NASA_CMR_LIMIT || 25
  });
  const datasets = entries.map(normalizeCollection);
  if (options.replace) await Dataset.deleteMany({});
  if (datasets.length > 0) {
    await Dataset.bulkWrite(datasets.map((dataset) => ({
      updateOne: { filter: { externalId: dataset.externalId }, update: { $set: dataset }, upsert: true }
    })));
  }
  return { fetched: entries.length, synced: datasets.length, replaced: Boolean(options.replace) };
}

async function searchEarthdataGranules(options) {
  try {
    const entries = await fetchEarthdataCollections(options);
    return { enabled: true, items: entries.map(normalizeCollection) };
  } catch (error) {
    console.warn('Earthdata search failed:', error.message);
    return { enabled: true, items: [], error: error.message };
  }
}

module.exports = { searchEarthdataGranules, syncEarthdataCollections };
