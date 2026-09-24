require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/db');
const ResearchResource = require('../src/models/ResearchResource');
const { syncOpenAlexWorks } = require('../src/services/openAlexService');

async function main() {
  await connectDatabase();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to sync OpenAlex works.');
  const replace = process.argv.includes('--replace');
  const search = process.argv.filter((argument) => argument !== '--replace').slice(2).join(' ') || undefined;

  const result = await syncOpenAlexWorks(ResearchResource, {
    search,
    replace
  });
  console.log(`OpenAlex sync complete: ${result.synced} works imported for "${result.search}"${result.replaced ? ' (old research records replaced)' : ''}.`);
}

main()
  .catch((error) => {
    console.error('OpenAlex sync failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });