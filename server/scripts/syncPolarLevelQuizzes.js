require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/db');
const Quiz = require('../src/models/Quiz');
const ResearchResource = require('../src/models/ResearchResource');

const levels = ['easy', 'moderate', 'challenging', 'advanced', 'expert'];

function questionFor(resource, index, level) {
  const answer = resource.title;
  const focus = String(resource.description || resource.title).replace(/\s+/g, ' ').trim().slice(0, 140);
  return {
    prompt: `${level[0].toUpperCase() + level.slice(1)} question ${index + 1}: which polar source record is connected to this evidence focus? ${focus}`,
    options: [answer, 'A non-polar administrative record', 'An unrelated spaceflight mission', 'No source-linked record'],
    answer,
    explanation: `The correct answer is the OpenAlex polar research record: ${answer}.`
  };
}

async function main() {
  await connectDatabase();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required to sync level quizzes.');
  const resources = await ResearchResource.find({ source: 'OpenAlex' }).sort({ year: -1, createdAt: -1 }).limit(75).select('title description _id').lean();
  if (resources.length < 15) throw new Error('At least 15 polar research records are required.');

  for (let levelIndex = 0; levelIndex < levels.length; levelIndex += 1) {
    const level = levels[levelIndex];
    const selected = resources.slice(levelIndex * 15, levelIndex * 15 + 15);
    if (selected.length < 15) throw new Error(`Not enough records for ${level} level.`);
    await Quiz.findOneAndUpdate(
      { difficulty: level },
      {
        title: `${level[0].toUpperCase() + level.slice(1)} Polar Research Assessment`,
        description: `A ${level} assessment with 15 source-grounded questions from Polar India Hub research records.`,
        researchResource: selected[0]._id,
        difficulty: level,
        status: 'published',
        questions: selected.map((resource, index) => questionFor(resource, index, level))
      },
      { upsert: true, new: true }
    );
  }
  console.log('Polar level quiz sync complete: 5 levels with 15 questions each.');
}

main()
  .catch((error) => { console.error('Polar level quiz sync failed:', error.message); process.exitCode = 1; })
  .finally(async () => { if (mongoose.connection.readyState !== 0) await mongoose.disconnect(); });