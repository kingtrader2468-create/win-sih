require('dotenv').config();
const app = require('./app');
const connectDatabase = require('./config/db');

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  const server = app.listen(port, () => {
    console.log(`Polar India Hub API listening on port ${port}`);
  });

  try {
    await connectDatabase();
  } catch (error) {
    console.warn('Warning: Unable to connect to MongoDB cluster immediately:', error.message);
  }

  return server;
}

startServer();
