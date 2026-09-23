const earthdataService = require('./earthdataService');
const ncporService = require('./ncporService');
const nsidcService = require('./nsidcService');

module.exports = {
  ...earthdataService,
  ...ncporService,
  ...nsidcService
};
