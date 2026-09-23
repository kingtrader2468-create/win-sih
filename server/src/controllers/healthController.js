const mongoose = require('mongoose');

function getHealth(request, response) {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isConnected = mongoose.connection.readyState === 1;

  if (!isConnected) {
    return response.status(503).json({
      ok: false,
      status: 'error',
      database: 'disconnected',
      service: 'Polar India Hub API',
      timestamp: new Date().toISOString()
    });
  }

  return response.status(200).json({
    ok: true,
    status: 'ok',
    database: 'connected',
    service: 'Polar India Hub API',
    timestamp: new Date().toISOString()
  });
}

module.exports = { getHealth };
