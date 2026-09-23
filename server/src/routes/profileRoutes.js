const express = require('express');
const { getProfile } = require('../controllers/profileController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/', optionalAuth, getProfile);

module.exports = router;
