require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/db');
const Quiz = require('../src/models/Quiz');
const ResearchResource = require('../src/models/ResearchResource');

async function main() {
  await connectDatabase();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to sync quizzes.');

  const resources = await ResearchResource.find({ source: 'OpenAlex' })
    .sort({ year: -1, createdAt: -1 })
    .limit(100)
    .select('title description year region sourceOrganization _id')
    .lean();
  if (!resources.length) throw new Error('No polar research resources are available.');

  for (const resource of resources) {
    const year = String(resource.year || 'the publication year');
    const region = resource.region || 'Polar Regions';
    const sourceOrganization = resource.sourceOrganization || 'OpenAlex';
    const focus = String(resource.description || resource.title).replace(/\s+/g, ' ').trim().slice(0, 180);
    const titleDistractor = 'A non-polar study unrelated to this source';
    const focusDistractor = 'A result that is not described in the source record';
    await Quiz.updateOne(
      { researchResource: resource._id },
      {
        $set: {
          title: `Source study: ${resource.title}`,
          description: 'A source-grounded learning check based on this polar research record.',
          researchResource: resource._id,
          status: 'published',
          questions: [
            { prompt: `Which study is being investigated in “${resource.title}”?`, options: [resource.title, titleDistractor, 'A general spaceflight report'], answer: resource.title, explanation: 'This quiz is anchored to the selected OpenAlex study.' },
            { prompt: `Which research focus is described in the abstract for “${resource.title}”?`, options: [focus, focusDistractor, 'No scientific observation is described'], answer: focus, explanation: 'The answer is taken directly from the source-linked abstract.' },
            { prompt: `Where and when was “${resource.title}” recorded?`, options: [`${region}, ${year}`, `${year}, outside the polar regions`, 'The source contains no location or year'], answer: `${region}, ${year}`, explanation: `The source metadata identifies ${region} and publication year ${year}.` },
            { prompt: `Which organization or publication venue is associated with this record?`, options: [sourceOrganization, 'An unrelated commercial publisher', 'No source organization'], answer: sourceOrganization, explanation: `The source metadata identifies ${sourceOrganization}.` }
          ]
        }
      },
      { upsert: true }
    );
  }

  console.log(`Polar quiz sync complete: ${resources.length} research-linked quizzes available.`);
}

main()
  .catch((error) => {
    console.error('Polar quiz sync failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });