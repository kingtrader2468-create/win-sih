/**
 * Optional NASA Earthdata / CMR Adapter
 * Provides search and metadata ingestion capabilities for polar cryospheric datasets.
 * Controlled by EXTERNAL_DATA_ENABLED in server environment.
 */

const CMR_BASE_URL = process.env.NASA_CMR_BASE_URL || 'https://cmr.earthdata.nasa.gov/search';

async function searchEarthdataGranules({ keyword = 'cryosphere', limit = 5 }) {
  if (process.env.EXTERNAL_DATA_ENABLED !== 'true') {
    return { enabled: false, items: [], message: 'External Earthdata integration is currently disabled.' };
  }

  const token = process.env.NASA_EARTHDATA_TOKEN;
  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const url = `${CMR_BASE_URL}/collections.json?keyword=${encodeURIComponent(keyword)}&page_size=${limit}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`CMR returned status ${response.status}`);
    }
    const data = await response.json();
    const entries = data.feed?.entry || [];
    return {
      enabled: true,
      items: entries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        summary: entry.summary,
        timeStart: entry.time_start,
        timeEnd: entry.time_end,
        source: 'NASA Earthdata CMR'
      }))
    };
  } catch (error) {
    console.warn('Optional Earthdata search failed:', error.message);
    return { enabled: true, items: [], error: error.message };
  }
}

module.exports = { searchEarthdataGranules };
