/**
 * Optional NCPOR / National Polar Data Centre Adapter
 * Provides metadata lookup for Indian Antarctic, Arctic, and Himalayan programs.
 */

async function fetchNCPORMetadata({ program = 'antarctica' }) {
  if (process.env.EXTERNAL_DATA_ENABLED !== 'true') {
    return { enabled: false, items: [], message: 'External NCPOR data adapter is currently disabled.' };
  }

  // Adapter definition ready for live institutional registry endpoint
  return {
    enabled: true,
    program,
    source: 'National Centre for Polar and Ocean Research (NCPOR)',
    items: []
  };
}

module.exports = { fetchNCPORMetadata };
