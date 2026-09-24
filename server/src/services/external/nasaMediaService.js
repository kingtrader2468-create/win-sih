const NASA_MEDIA_URL = 'https://images-api.nasa.gov/search';

async function fetchNasaMedia(query, limit = 100, page = 1) {
  const url = new URL(NASA_MEDIA_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('media_type', 'image,video,audio');
  url.searchParams.set('page_size', String(Math.min(Math.max(Number(limit) || 100, 1), 100)));
  url.searchParams.set('page', String(Math.max(Number(page) || 1, 1)));
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Polar-India-Hub/1.0' },
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`NASA media request failed with status ${response.status}: ${detail.slice(0, 200)}`);
  }
  const payload = await response.json();
  return payload.collection?.items || [];
}

async function searchNasaMedia(query, options = {}) {
  const limit = options.limit || 12;
  const page = options.page || 1;
  const polarTerms = /antarctica|arctic|polar|cryosphere|ice|glacier|sea ice|himalaya|greenland/i;
  const polarQuery = polarTerms.test(query) ? query : `${query} polar`;
  const items = await fetchNasaMedia(polarQuery, limit, page);
  return items.map((item) => normalizeNasaMedia(item, polarQuery)).filter((item) => item.sourceId);
}

function getPolarRegion(item, query = '') {
  const text = `${query} ${item.data?.[0]?.title || ''} ${item.data?.[0]?.description || ''}`.toLowerCase();
  if (text.includes('antarctic')) return 'Antarctica';
  if (text.includes('arctic')) return 'Arctic';
  if (text.includes('himalaya')) return 'Himalaya';
  if (text.includes('greenland')) return 'Greenland';
  return 'Polar Regions';
}

function normalizeNasaMedia(item, query = '') {
  const data = item.data?.[0] || {};
  const links = item.links || [];
  const thumbnail = links.find((link) => link.rel === 'preview')?.href || '';
  const sourceUrl = data.nasa_id ? `https://images.nasa.gov/details/${data.nasa_id}` : '';
  return {
    title: data.title || 'NASA polar media',
    type: data.media_type === 'video' ? 'Video' : data.media_type === 'audio' ? 'Audio' : 'Image',
    description: data.description || data.title || '',
    region: getPolarRegion(item, query),
    url: thumbnail,
    thumbnailUrl: thumbnail,
    credit: data.photographer || data.center || 'NASA',
    source: 'NASA Image and Video Library',
    sourceId: data.nasa_id,
    sourceUrl,
    status: 'published'
  };
}

async function syncNasaMedia(Media, options = {}) {
  const queries = options.queries || (process.env.NASA_MEDIA_QUERIES || 'Antarctica,Arctic,Himalaya,Greenland,polar cryosphere,sea ice,glacier')
    .split(',').map((query) => query.trim()).filter(Boolean);
  const limit = options.limit || process.env.NASA_MEDIA_LIMIT || 100;
  const items = [];
  for (const query of queries) {
    items.push(...(await fetchNasaMedia(query, limit)).map((item) => normalizeNasaMedia(item, query)));
  }
  const media = [...new Map(items.map((item) => [item.sourceId, item])).values()];

  if (options.replace) await Media.deleteMany({ source: 'NASA Image and Video Library' });
  for (let offset = 0; offset < media.length; offset += 100) {
    const batch = media.slice(offset, offset + 100);
    await Media.bulkWrite(batch.map((item) => ({
      updateOne: { filter: { sourceId: item.sourceId }, update: { $set: item }, upsert: true }
    })));
  }
  return { fetched: items.length, synced: media.length, replaced: Boolean(options.replace) };
}

module.exports = { searchNasaMedia, syncNasaMedia };