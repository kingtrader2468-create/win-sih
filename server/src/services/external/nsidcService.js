/**
 * Optional NSIDC (National Snow and Ice Data Center) Adapter
 */

async function fetchNSIDCSeaIceIndex() {
  if (process.env.EXTERNAL_DATA_ENABLED !== 'true') {
    return { enabled: false, message: 'External NSIDC adapter is currently disabled.' };
  }

  return {
    enabled: true,
    source: 'National Snow and Ice Data Center (NSIDC)',
    data: null
  };
}

module.exports = { fetchNSIDCSeaIceIndex };
