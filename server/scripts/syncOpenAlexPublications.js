require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/db');
const Publication = require('../src/models/Publication');
const ResearchResource = require('../src/models/ResearchResource');

async function main() {
  await connectDatabase();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to sync publications.');

  const works = await ResearchResource.find({ source: 'OpenAlex', openAlexId: { $exists: true } })
    .select('title authors description year sourceUrl openAlexId sourceOrganization')
    .lean();

  const publications = works.map((work) => ({
    title: work.title,
    authors: work.authors || [],
    year: work.year,
    abstract: work.description,
    url: work.sourceUrl,
    source: 'OpenAlex',
    sourceId: work.openAlexId,
    sourceUrl: work.sourceUrl,
    journal: work.sourceOrganization || 'OpenAlex',
    status: 'published'
  }));

  if (!publications.length) throw new Error('No OpenAlex research records found; existing publications were preserved.');
  await Publication.deleteMany({ source: 'OpenAlex' });

  for (let offset = 0; offset < publications.length; offset += 100) {
    const batch = publications.slice(offset, offset + 100);
    await Publication.bulkWrite(batch.map((publication) => ({
      updateOne: {
        filter: { sourceId: publication.sourceId },
        update: { $set: publication },
        upsert: true
      }
    })));
  }

  console.log(`OpenAlex publication sync complete: ${publications.length} publications available.`);
}

main()
  .catch((error) => {
    console.error('OpenAlex publication sync failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });