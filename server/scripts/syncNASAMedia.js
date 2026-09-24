require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/db');
const Media = require('../src/models/Media');
const { syncNasaMedia } = require('../src/services/external/nasaMediaService');

async function main() {
  await connectDatabase();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to sync NASA media.');
  const result = await syncNasaMedia(Media, { replace: process.argv.includes('--replace') });
  console.log(`NASA media sync complete: ${result.synced} media records imported.`);
}

main()
  .catch((error) => {
    console.error('NASA media sync failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });