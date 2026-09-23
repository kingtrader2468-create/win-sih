const express = require('express');
const { getDashboard } = require('../controllers/dashboardController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', optionalAuth, getDashboard);

module.exports = router;

