const earthdataService = require('./earthdataService');
const ncporService = require('./ncporService');
const nsidcService = require('./nsidcService');
const nasaMediaService = require('./nasaMediaService');

module.exports = {
  ...earthdataService,
  ...ncporService,
  ...nsidcService,
  ...nasaMediaService
};
