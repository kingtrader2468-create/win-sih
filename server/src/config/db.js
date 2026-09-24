const dns = require('node:dns');

const dnsServers = (process.env.MONGODB_DNS_SERVERS || '')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);
if (dnsServers.length > 0) dns.setServers(dnsServers);

const mongoose = require('mongoose');

const mongoConnectOptions = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 120000,
  family: 4,
  autoIndex: false
};

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not set; API is running without a database connection.');
    return false;
  }

  try {
    await mongoose.connect(uri, mongoConnectOptions);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed:', error.message);
    return false;
  }
}

module.exports = connectDatabase;
