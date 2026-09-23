const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not set; API is running without a database connection.');
    return;
  }
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDatabase;
