const express = require('express');
const {
  getMapStations,
  getMapConfig,
  getMapLayers,
  getMapProjects,
  getStationByCode
} = require('../controllers/mapController');

const router = express.Router();

router.get('/stations', getMapStations);
router.get('/config', getMapConfig);
router.get('/stations/:code', getStationByCode);
router.get('/layers', getMapLayers);
router.get('/projects', getMapProjects);

module.exports = router;
