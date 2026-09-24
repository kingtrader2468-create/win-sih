require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/db');
const Mystery = require('../src/models/Mystery');
const ResearchResource = require('../src/models/ResearchResource');

function truncate(value, length = 420) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

async function main() {
  await connectDatabase();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to sync mysteries.');

  const resources = await ResearchResource.find({ source: 'OpenAlex' })
    .sort({ year: -1, createdAt: -1 })
    .limit(100)
    .select('title description year region openAlexId')
    .lean();
  if (!resources.length) throw new Error('No OpenAlex research resources are available.');

  for (const resource of resources) {
    const correctAnswer = resource.title;
    const mystery = {
      researchResource: resource._id,
      title: `Polar investigation: ${resource.title}`,
      description: `Trace the evidence behind this source-linked polar record from ${resource.region || 'the polar regions'}.`,
      difficulty: 'beginner',
      estimatedTime: '5 minutes',
      source: 'OpenAlex',
      status: 'published',
      clues: [{
        title: 'Identify the authoritative source record',
        description: truncate(resource.description || `This investigation is based on the polar research record published in ${resource.year || 'the source archive'}.`),
        choices: [correctAnswer, 'A general non-polar science record', 'An unrelated administrative report'],
        correctAnswer
      }]
    };
    await Mystery.updateOne({ researchResource: resource._id }, { $set: mystery }, { upsert: true });
  }

  console.log(`Polar mystery sync complete: ${resources.length} interactive mysteries available.`);
}

main()
  .catch((error) => {
    console.error('Polar mystery sync failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });