require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/db');
const Dataset = require('../src/models/Dataset');
const { syncEarthdataCollections } = require('../src/services/external/earthdataService');

async function main() {
  await connectDatabase();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to sync NASA Earthdata.');
  const result = await syncEarthdataCollections(Dataset, { replace: process.argv.includes('--replace') });
  console.log(`NASA Earthdata sync complete: ${result.synced} datasets imported${result.replaced ? ' (old datasets replaced)' : ''}.`);
}

main()
  .catch((error) => {
    console.error('NASA Earthdata sync failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });