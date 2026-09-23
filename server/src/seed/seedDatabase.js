require('dotenv').config();
const mongoose = require('mongoose');
const models = require('../models');
const { demoData } = require('./demoData');

const fixedTimestamp = new Date('2026-01-01T00:00:00.000Z');

function getDatabaseName(uri) {
  try {
    const databaseName = decodeURIComponent(new URL(uri).pathname.replace(/^\//, '').split('/')[0]);
    // MongoDB uses "test" when the connection string omits a database name.
    // Treat that explicit driver default the same as a URI ending in /test.
    return databaseName || 'test';
  } catch {
    return '';
  }
}

function assertDevelopmentTarget(uri) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Seed aborted: NODE_ENV must be development.');
  }
  if (!uri) {
    throw new Error('Seed aborted: MONGODB_URI is required.');
  }
  const databaseName = getDatabaseName(uri);
  if (!/(?:^|[_-])(dev|development|test)$|^(dev|development|test)$/i.test(databaseName)) {
    throw new Error('Seed aborted: MONGODB_URI must target a database ending in dev, development, or test.');
  }
}

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  assertDevelopmentTarget(uri);
  await mongoose.connect(uri);

  try {
    const databaseName = mongoose.connection.name;
    if (!/(?:^|[_-])(dev|development|test)$|^(dev|development|test)$/i.test(databaseName)) {
      throw new Error('Seed aborted: connected database is not development-scoped.');
    }

    const modelEntries = Object.entries(models);
    await Promise.all(modelEntries.map(([, Model]) => Model.deleteMany({})));

    for (const [modelName, Model] of modelEntries) {
      const records = demoData[modelName] || [];
      if (records.length) {
        await Model.insertMany(records.map((record) => ({
          ...record,
          createdAt: fixedTimestamp,
          updatedAt: fixedTimestamp
        })));
      }
    }

    console.log('Seed complete: deterministic Prototype Demo Content inserted into development collections only.');
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { assertDevelopmentTarget, getDatabaseName, seedDatabase };
