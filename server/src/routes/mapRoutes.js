const express = require('express');
const {
  getMapStations,
  getMapLayers,
  getMapProjects,
  getStationByCode
} = require('../controllers/mapController');

const router = express.Router();

router.get('/stations', getMapStations);
router.get('/stations/:code', getStationByCode);
router.get('/layers', getMapLayers);
router.get('/projects', getMapProjects);

module.exports = router;
