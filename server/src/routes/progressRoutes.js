const express = require('express');
const { getProgress } = require('../controllers/progressController');

const router = express.Router();
router.get('/', getProgress);

module.exports = router;
