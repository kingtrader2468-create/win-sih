const dns = require('node:dns');

dns.setDefaultResultOrder('ipv4first');

const OPENALEX_API_URL = 'https://api.openalex.org/works';
const POLAR_RELEVANCE_PATTERN = /antarct|arctic|polar|cryosphere|glacier|glaciolog|sea ice|ice sheet|ice shelf|ice core|permafrost|snowpack|himalay|greenland|svalbard|albedo|frost|subantarctic|north pole|south pole/i;

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== 'object') return '';

  return Object.entries(invertedIndex)
    .flatMap(([word, positions]) => positions.map((position) => ({ word, position })))
    .sort((left, right) => left.position - right.position)
    .map(({ word }) => word)
    .join(' ');
}

function normalizeWork(work) {
  const primaryLocation = work.primary_location || {};
  const source = primaryLocation.source || {};
  const landingPage = primaryLocation.landing_page_url || work.doi || '';
  const authors = (work.authorships || [])
    .map((authorship) => authorship.author?.display_name)
    .filter(Boolean);
  const keywords = (work.keywords || []).map((keyword) => keyword.display_name).filter(Boolean);
  const abstract = reconstructAbstract(work.abstract_inverted_index);

  return {
    title: work.title || 'Untitled OpenAlex work',
    type: work.type === 'book' ? 'Book' : 'Research Paper',
    description: abstract || work.title || '',
    year: work.publication_year,
    region: 'Polar Regions',
    researchArea: 'Polar Science',
    source: 'OpenAlex',
    authors,
    fileUrl: primaryLocation.pdf_url || undefined,
    sourceUrl: landingPage,
    documentType: work.type,
    verificationStatus: 'Source-linked Resource',
    sourceOrganization: source.display_name || 'OpenAlex',
    citation: work.cited_by_count ? `${work.cited_by_count} citations` : undefined,
    tags: keywords,
    openAlexId: work.id,
    lastVerifiedAt: new Date(),
    status: 'published'
  };
}

async function fetchOpenAlexWorks({ search, perPage, cursor }) {
  const url = new URL(OPENALEX_API_URL);
  url.searchParams.set('search', search);
  url.searchParams.set('per-page', String(perPage));
  url.searchParams.set('sort', 'cited_by_count:desc');
  url.searchParams.set('cursor', cursor);
  if (process.env.OPENALEX_API_KEY) url.searchParams.set('api_key', process.env.OPENALEX_API_KEY);
  if (process.env.OPENALEX_EMAIL) url.searchParams.set('mailto', process.env.OPENALEX_EMAIL);

  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Polar-India-Hub/1.0' },
    signal: AbortSignal.timeout(120000)
  });
  if (!response.ok) throw new Error(`OpenAlex request failed with status ${response.status}.`);

  const payload = await response.json();
  return { results: payload.results || [], nextCursor: payload.meta?.next_cursor };
}

async function syncOpenAlexWorks(ResearchResource, options = {}) {
  const search = options.search || process.env.OPENALEX_SEARCH || 'polar science Antarctica Arctic Himalaya';
  const perPage = Math.min(Math.max(Number(options.perPage || process.env.OPENALEX_PER_PAGE || 100), 1), 200);
  const maxWorks = Math.min(Math.max(Number(options.maxWorks || process.env.OPENALEX_MAX_WORKS || 1000), perPage), 10000);
  const works = [];
  let cursor = '*';

  while (cursor && works.length < maxWorks) {
    console.log(`Fetching OpenAlex page at ${works.length} records...`);
    const page = await fetchOpenAlexWorks({ search, perPage: Math.min(perPage, maxWorks - works.length), cursor });
    works.push(...page.results);
    cursor = page.nextCursor;
    if (!page.results.length) break;
  }

  const resources = works
    .filter((work) => POLAR_RELEVANCE_PATTERN.test([
      work.title,
      reconstructAbstract(work.abstract_inverted_index),
      ...(work.keywords || []).map((keyword) => keyword.display_name)
    ].filter(Boolean).join(' ')))
    .map(normalizeWork)
    .filter((resource) => resource.openAlexId);

  if (options.replace && resources.length === 0) {
    throw new Error('OpenAlex returned no usable research records; existing records were preserved.');
  }
  if (options.replace) await ResearchResource.deleteMany({});

  if (resources.length > 0) {
    console.log(`Writing ${resources.length} OpenAlex records to MongoDB...`);
    for (let offset = 0; offset < resources.length; offset += 100) {
      const batch = resources.slice(offset, offset + 100);
      await ResearchResource.bulkWrite(batch.map((resource) => ({
        updateOne: {
          filter: { openAlexId: resource.openAlexId },
          update: { $set: resource },
          upsert: true
        }
      })));
      console.log(`Saved ${Math.min(offset + batch.length, resources.length)} of ${resources.length} OpenAlex records.`);
    }
  }

  return { search, fetched: works.length, synced: resources.length, replaced: Boolean(options.replace), maxWorks };
}

module.exports = { syncOpenAlexWorks };