const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const NASA_MEDIA_API = 'https://images-api.nasa.gov/search';
const imageCache = new Map();
const relatedImageCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function searchTerm(station) {
  return `${station.name} station`;
}

async function findCommonsImage(station) {
  const cached = imageCache.get(station.code);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const url = new URL(COMMONS_API);
  url.searchParams.set('action', 'query');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrsearch', searchTerm(station));
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '1');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|extmetadata');
  url.searchParams.set('iiurlwidth', '900');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Wikimedia Commons request failed with HTTP ${response.status}`);

  const payload = await response.json();
  const page = Object.values(payload.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  const title = page?.title || '';
  const distinctiveWords = station.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((word) => word.length >= 5 && !['station', 'research', 'international'].includes(word));
  const titleMatchesStation = distinctiveWords.some((word) => title.toLowerCase().includes(word));
  if (!titleMatchesStation || !info?.mime?.startsWith('image/')) return null;
  const value = info?.thumburl || info?.url;
  if (!value) return null;

  const result = {
    image: value,
    imageSource: 'Wikimedia Commons',
    imageSourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title).replace(/%20/g, '_')}`,
    imageLicense: info.extmetadata?.LicenseShortName?.value || 'Wikimedia Commons license'
  };
  imageCache.set(station.code, { expiresAt: Date.now() + CACHE_TTL_MS, value: result });
  return result;
}

async function findRelatedNasaImage(station) {
  const cached = relatedImageCache.get(station.region);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const url = new URL(NASA_MEDIA_API);
  url.searchParams.set('q', `${station.region} polar research`);
  url.searchParams.set('media_type', 'image');
  url.searchParams.set('page_size', '10');

  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Polar-India-Hub/1.0' }
    , signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) return null;

  const items = response.json ? (await response.json()).collection?.items || [] : [];
  const item = items.find((candidate) => candidate.links?.some((link) => link.rel === 'preview'));
  const data = item?.data?.[0];
  const image = item?.links?.find((link) => link.rel === 'preview')?.href;
  if (!image || !data) return null;

  const value = {
    image,
    imageSource: 'NASA Image and Video Library · Related polar image',
    imageSourceUrl: data.nasa_id ? `https://images.nasa.gov/details/${data.nasa_id}` : 'https://images.nasa.gov/',
    imageLicense: 'NASA media usage guidance'
  };
  relatedImageCache.set(station.region, { expiresAt: Date.now() + CACHE_TTL_MS, value });
  return value;
}

async function enrichStationsWithImages(stations) {
  const regions = [...new Set(stations.filter((station) => !station.image || station.image.includes('unsplash.com')).map((station) => station.region))];
  const relatedByRegion = new Map();
  regions.forEach((region) => {
    const cached = relatedImageCache.get(region);
    if (cached && cached.expiresAt > Date.now()) {
      relatedByRegion.set(region, cached.value);
      return;
    }

    void findRelatedNasaImage({
      code: `region-${region}`,
      name: region,
      region
    }).catch((error) => {
      console.warn(`NASA related image unavailable for ${region}:`, error.message);
    });
  });

  return stations.map((station) => ({
    ...station,
    ...(station.image && !station.image.includes('unsplash.com')
      ? { imageSource: station.source, imageSourceUrl: station.sourceUrl }
      : (relatedByRegion.get(station.region) || { image: null, imageSource: null, imageSourceUrl: null }))
  }));
}

module.exports = { enrichStationsWithImages };
